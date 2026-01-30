import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';
import 'isomorphic-fetch';

export interface GraphEmail {
  id: string;
  subject?: string;
  sender?: {
    emailAddress?: {
      address?: string;
      name?: string;
    };
  };
  toRecipients?: Array<{
    emailAddress?: {
      address?: string;
      name?: string;
    };
  }>;
  ccRecipients?: Array<{
    emailAddress?: {
      address?: string;
      name?: string;
    };
  }>;
  body?: {
    content?: string;
    contentType?: string;
  };
  sentDateTime?: string;
}

export interface GraphTeamsMessage {
  id: string;
  chatId?: string;
  channelIdentity?: {
    teamId?: string;
    channelId?: string;
  };
  from?: {
    user?: {
      id?: string;
      displayName?: string;
      userIdentityType?: string;
    };
  };
  body?: {
    content?: string;
    contentType?: string;
  };
  createdDateTime?: string;
  messageType?: string;
}

export interface UnifiedCommunication {
  id: string;
  source: 'outlook' | 'teams';
  chatType?: 'chat' | 'channel' | 'meeting' | null;
  subject?: string;
  sender?: string;
  senderName?: string;
  recipients?: string[];
  content?: string;
  sentDateTime?: string;
}

export interface GraphUser {
  id: string;
  mail?: string;
  department?: string;
  country?: string;
  displayName?: string;
}

export interface UserMetadata {
  departments: string[];
  countries: string[];
}

export class MicrosoftGraphService {
  private client: Client | null = null;
  private msalApp: ConfidentialClientApplication | null = null;
  private departmentVariants: Map<string, Set<string>> = new Map();
  private countryVariants: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeClient();
  }

  public async initializeClient(config: Record<string, string> = {}) {
    const clientId = config.CLIENT_ID || process.env.CLIENT_ID;
    const clientSecret = config.CLIENT_SECRET || process.env.CLIENT_SECRET;
    const tenantId = config.TENANT_ID || process.env.TENANT_ID;

    if (!clientId || !clientSecret || !tenantId) {
      console.warn('Microsoft Graph credentials not found. Some functionality will be limited.');
      this.client = null;
      this.msalApp = null;
      return;
    }

    try {
      this.msalApp = new ConfidentialClientApplication({
        auth: {
          clientId,
          clientSecret,
          authority: `https://login.microsoftonline.com/${tenantId}`
        }
      });
      
      this.client = Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => {
            const clientCredentialRequest = {
              scopes: ['https://graph.microsoft.com/.default'],
            };
            const response = await this.msalApp!.acquireTokenByClientCredential(clientCredentialRequest);
            return response?.accessToken || '';
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize Microsoft Graph client:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Test with /users endpoint which we have User.Read.All permission for
      await this.client.api('/users').select('id').top(1).get();
      return true;
    } catch (error) {
      console.error('Microsoft Graph connection test failed:', error);
      return false;
    }
  }

  // Normalize department/country name: trim and title case
  private normalizeName(name: string): string {
    return name.trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async getUsersMetadata(): Promise<UserMetadata> {
    if (!this.client) {
      throw new Error('Microsoft Graph client not initialized. Please configure CLIENT_ID, CLIENT_SECRET, and TENANT_ID.');
    }

    try {
      const users = await this.client
        .api('/users')
        .select('id,mail,department,country,displayName')
        .get();

      const extraCountries = ['Panama', 'Ecuador'];
      const extraDepartments = ['RRHH', 'Mercadeo', 'Finanzas', 'Contabilidad'];

      // Maps to track canonical names -> all variants
      const departmentMap = new Map<string, Set<string>>();
      const countryMap = new Map<string, Set<string>>();

      // Add defaults first
      extraDepartments.forEach(dept => {
        const canonical = this.normalizeName(dept);
        if (!departmentMap.has(canonical)) {
          departmentMap.set(canonical, new Set([dept]));
        }
      });
      extraCountries.forEach(country => {
        const canonical = this.normalizeName(country);
        if (!countryMap.has(canonical)) {
          countryMap.set(canonical, new Set([country]));
        }
      });

      users.value.forEach((user: GraphUser) => {
        if (user.department) {
          const canonical = this.normalizeName(user.department);
          if (!departmentMap.has(canonical)) {
            departmentMap.set(canonical, new Set());
          }
          departmentMap.get(canonical)!.add(user.department);
        }
        if (user.country) {
          const canonical = this.normalizeName(user.country);
          // Remove Peru if found
          if (canonical === 'Peru') return;
          if (!countryMap.has(canonical)) {
            countryMap.set(canonical, new Set());
          }
          countryMap.get(canonical)!.add(user.country);
        }
      });

      // Store the variant maps for use in filtering
      this.departmentVariants = departmentMap;
      this.countryVariants = countryMap;

      return {
        departments: Array.from(departmentMap.keys()).sort(),
        countries: Array.from(countryMap.keys()).sort(),
      };
    } catch (error) {
      console.error('Failed to fetch user metadata:', error);
      throw new Error(`Microsoft Graph API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllUsersEmails(
    dateFrom: Date,
    dateTo: Date,
    departments?: string[],
    countries?: string[]
  ): Promise<GraphEmail[]> {
    if (!this.client) {
      throw new Error('Microsoft Graph client not initialized. Please configure CLIENT_ID, CLIENT_SECRET, and TENANT_ID.');
    }

    try {
      // Get all users with metadata
      const usersResponse = await this.client
        .api('/users')
        .select('id,mail,department,country,displayName')
        .get();
      
      // Filter users by department and country if specified
      let filteredUsers = usersResponse.value;
      
      console.log(`Total users before filtering: ${filteredUsers.length}`);
      
      if (departments && departments.length > 0) {
        // Normalize selected department names for case-insensitive comparison
        const normalizedDepartments = new Set(
          departments.map(dept => this.normalizeName(dept))
        );
        
        filteredUsers = filteredUsers.filter((user: GraphUser) => 
          user.department && normalizedDepartments.has(this.normalizeName(user.department))
        );
        console.log(`Users after department filter (${departments.join(', ')}): ${filteredUsers.length}`);
      }
      
      if (countries && countries.length > 0) {
        // Normalize selected country names for case-insensitive comparison
        const normalizedCountries = new Set(
          countries.map(country => this.normalizeName(country))
        );
        
        filteredUsers = filteredUsers.filter((user: GraphUser) => 
          user.country && normalizedCountries.has(this.normalizeName(user.country))
        );
        console.log(`Users after country filter (${countries.join(', ')}): ${filteredUsers.length}`);
      }

      const allEmails: GraphEmail[] = [];

      // Use exact date range for filtering
      const dateFromISO = dateFrom.toISOString();
      const dateToISO = dateTo.toISOString();
      
      console.log(`Fetching emails from ${filteredUsers.length} users for date range: ${dateFromISO} to ${dateToISO}`);

      // Fetch all emails for each filtered user with pagination
      for (const user of filteredUsers) {
        try {
          let nextLink: string | undefined;
          let pageCount = 0;
          
          // First request with exact date range filter (ge = greater or equal, le = less or equal)
          let response = await this.client
            .api(`/users/${user.id}/messages`)
            .filter(`sentDateTime ge ${dateFromISO} and sentDateTime le ${dateToISO}`)
            .select('id,subject,sender,toRecipients,ccRecipients,body,sentDateTime')
            .top(100) // Page size for pagination
            .get();
          
          allEmails.push(...response.value);
          nextLink = response['@odata.nextLink'];
          pageCount++;
          
          // Follow pagination to get ALL emails
          while (nextLink) {
            response = await this.client
              .api(nextLink)
              .get();
            
            allEmails.push(...response.value);
            nextLink = response['@odata.nextLink'];
            pageCount++;
            
            // Safety limit to prevent infinite loops (max 100 pages = 10,000 emails per user)
            if (pageCount >= 100) {
              console.log(`Reached pagination limit for user ${user.id}`);
              break;
            }
          }
        } catch (userError) {
          console.error(`Failed to fetch emails for user ${user.id}:`, userError);
          // Continue with other users
        }
      }

      return allEmails;
    } catch (error) {
      console.error('Failed to fetch emails from Microsoft Graph:', error);
      throw new Error(`Microsoft Graph API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getEmailsCount(): Promise<number> {
    if (!this.client) {
      return 0;
    }

    try {
      const users = await this.client.api('/users').get();
      let totalCount = 0;

      for (const user of users.value) {
        try {
          const messages = await this.client
            .api(`/users/${user.id}/messages`)
            .count(true)
            .top(1)
            .get();
          
          totalCount += messages['@odata.count'] || 0;
        } catch (userError) {
          console.error(`Failed to count emails for user ${user.id}:`, userError);
        }
      }

      return totalCount;
    } catch (error) {
      console.error('Failed to count emails:', error);
      return 0;
    }
  }

  async getAllUsersTeamsMessages(
    dateFrom: Date,
    dateTo: Date,
    departments?: string[],
    countries?: string[]
  ): Promise<GraphTeamsMessage[]> {
    if (!this.client) {
      throw new Error('Microsoft Graph client not initialized. Please configure CLIENT_ID, CLIENT_SECRET, and TENANT_ID.');
    }

    try {
      // Get all users with metadata
      const usersResponse = await this.client
        .api('/users')
        .select('id,mail,department,country,displayName')
        .get();
      
      // Filter users by department and country if specified
      let filteredUsers = usersResponse.value;
      
      if (departments && departments.length > 0) {
        const normalizedDepartments = new Set(
          departments.map(dept => this.normalizeName(dept))
        );
        
        filteredUsers = filteredUsers.filter((user: GraphUser) => 
          user.department && normalizedDepartments.has(this.normalizeName(user.department))
        );
      }
      
      if (countries && countries.length > 0) {
        const normalizedCountries = new Set(
          countries.map(country => this.normalizeName(country))
        );
        
        filteredUsers = filteredUsers.filter((user: GraphUser) => 
          user.country && normalizedCountries.has(this.normalizeName(user.country))
        );
      }

      const allMessages: GraphTeamsMessage[] = [];

      // Use exact date range for filtering
      const dateFromISO = dateFrom.toISOString();
      const dateToISO = dateTo.toISOString();
      
      console.log(`Fetching Teams messages from ${filteredUsers.length} users for date range: ${dateFromISO} to ${dateToISO}`);

      // Fetch Teams messages for each filtered user
      for (const user of filteredUsers) {
        try {
          // Get all chats for the user
          const chatsResponse = await this.client
            .api(`/users/${user.id}/chats`)
            .get();

          // For each chat, get messages with exact date range
          for (const chat of chatsResponse.value) {
            try {
              const messagesResponse = await this.client
                .api(`/users/${user.id}/chats/${chat.id}/messages`)
                .filter(`createdDateTime ge ${dateFromISO} and createdDateTime le ${dateToISO}`)
                .top(1000)
                .get();

              allMessages.push(...messagesResponse.value);
            } catch (chatError) {
              console.error(`Failed to fetch messages for chat ${chat.id}:`, chatError);
              // Continue with other chats
            }
          }
        } catch (userError) {
          console.error(`Failed to fetch Teams messages for user ${user.id}:`, userError);
          // Continue with other users
        }
      }

      console.log(`Retrieved ${allMessages.length} Teams messages`);
      return allMessages;
    } catch (error) {
      console.error('Failed to fetch Teams messages from Microsoft Graph:', error);
      throw new Error(`Microsoft Graph API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllUsersCommunications(
    dateFrom: Date,
    dateTo: Date,
    departments?: string[],
    countries?: string[]
  ): Promise<UnifiedCommunication[]> {
    const communications: UnifiedCommunication[] = [];

    try {
      // Fetch emails and Teams messages in parallel with exact date range
      const [emails, teamsMessages] = await Promise.all([
        this.getAllUsersEmails(dateFrom, dateTo, departments, countries),
        this.getAllUsersTeamsMessages(dateFrom, dateTo, departments, countries)
      ]);

      // Convert emails to unified format
      for (const email of emails) {
        communications.push({
          id: email.id,
          source: 'outlook',
          chatType: undefined,
          subject: email.subject,
          sender: email.sender?.emailAddress?.address,
          senderName: email.sender?.emailAddress?.name,
          recipients: [
            ...(email.toRecipients?.map(r => r.emailAddress?.address).filter(Boolean) || []),
            ...(email.ccRecipients?.map(r => r.emailAddress?.address).filter(Boolean) || [])
          ] as string[],
          content: email.body?.content,
          sentDateTime: email.sentDateTime
        });
      }

      // Convert Teams messages to unified format
      for (const msg of teamsMessages) {
        const chatType = msg.channelIdentity ? 'channel' : 'chat';
        
        communications.push({
          id: msg.id,
          source: 'teams',
          chatType,
          subject: undefined, // Teams messages don't have subjects
          sender: msg.from?.user?.id,
          senderName: msg.from?.user?.displayName,
          recipients: [], // Teams messages don't have explicit recipients list
          content: msg.body?.content,
          sentDateTime: msg.createdDateTime
        });
      }

      console.log(`Total communications: ${communications.length} (${emails.length} emails + ${teamsMessages.length} Teams messages)`);
      return communications;
    } catch (error) {
      console.error('Failed to fetch communications:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}