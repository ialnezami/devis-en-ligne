import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  CalendarIntegration, 
  IntegrationConfig, 
  IntegrationResponse, 
  IntegrationType,
  EventData,
  EventResult,
  CalendarData,
  CalendarResult,
  TimeSlotResult
} from '../../interfaces/integration.interface';

@Injectable()
export class GoogleCalendarIntegration implements CalendarIntegration {
  public readonly name = 'Google Calendar';
  public readonly type: IntegrationType & { category: 'calendar' } = {
    category: 'calendar',
    provider: 'google',
    version: '1.0',
    capabilities: ['events', 'calendars', 'availability', 'scheduling', 'reminders'],
  };

  private readonly logger = new Logger(GoogleCalendarIntegration.name);
  private config: IntegrationConfig | null = null;
  private auth: any = null;
  private calendar: any = null;

  constructor(private configService: ConfigService) {}

  async initialize(config: IntegrationConfig): Promise<void> {
    try {
      this.config = config;
      this.logger.log('Google Calendar integration initialized', { id: config.id });
      
      // Validate credentials
      if (!config.credentials.clientId || !config.credentials.clientSecret || !config.credentials.refreshToken) {
        throw new Error('Invalid Google Calendar credentials');
      }

      // Initialize Google APIs
      const { google } = require('googleapis');
      
      // Create OAuth2 client
      this.auth = new google.auth.OAuth2(
        config.credentials.clientId,
        config.credentials.clientSecret,
        config.credentials.redirectUri
      );

      // Set refresh token
      this.auth.setCredentials({
        refresh_token: config.credentials.refreshToken,
      });

      // Create Calendar API client
      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    } catch (error) {
      this.logger.error('Error initializing Google Calendar integration', { error: error.message });
      throw error;
    }
  }

  async testConnection(): Promise<IntegrationResponse> {
    try {
      if (!this.calendar) {
        return { success: false, error: 'Integration not initialized' };
      }

      // Test Google Calendar connection by listing calendars
      const response = await this.calendar.calendarList.list();
      
      if (response.data && response.data.items) {
        this.logger.log('Google Calendar connection test successful', { 
          calendarCount: response.data.items.length 
        });
        return { success: true };
      } else {
        return { success: false, error: 'Connection test failed' };
      }
    } catch (error) {
      this.logger.error('Google Calendar connection test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  getCapabilities(): string[] {
    return this.type.capabilities;
  }

  isFeatureSupported(feature: string): boolean {
    return this.type.capabilities.includes(feature);
  }

  async createEvent(event: EventData): Promise<IntegrationResponse<EventResult>> {
    try {
      if (!this.isFeatureSupported('events')) {
        return { success: false, error: 'Events feature not supported' };
      }

      const googleEvent = this.mapEventToGoogle(event);
      const response = await this.calendar.events.insert({
        calendarId: event.calendarId || 'primary',
        resource: googleEvent,
        sendUpdates: 'all',
      });

      if (response.data && response.data.id) {
        const result: EventResult = {
          id: response.data.id,
          externalId: response.data.id,
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          attendees: event.attendees || [],
          location: event.location,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.logger.log('Event created in Google Calendar', { eventId: result.id });
        return { success: true, data: result };
      } else {
        return { success: false, error: 'Failed to create event' };
      }
    } catch (error) {
      this.logger.error('Error creating event in Google Calendar', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async updateEvent(eventId: string, updates: Partial<EventData>): Promise<IntegrationResponse<EventResult>> {
    try {
      if (!this.isFeatureSupported('events')) {
        return { success: false, error: 'Events feature not supported' };
      }

      // Get current event to merge updates
      const currentEvent = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      if (!currentEvent.data) {
        return { success: false, error: 'Event not found' };
      }

      const updatedEvent = this.mergeEventUpdates(currentEvent.data, updates);
      
      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updatedEvent,
        sendUpdates: 'all',
      });

      if (response.data && response.data.id) {
        // Get updated event
        return await this.getEvent(eventId);
      } else {
        return { success: false, error: 'Failed to update event' };
      }
    } catch (error) {
      this.logger.error('Error updating event in Google Calendar', { eventId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async deleteEvent(eventId: string): Promise<IntegrationResponse<void>> {
    try {
      if (!this.isFeatureSupported('events')) {
        return { success: false, error: 'Events feature not supported' };
      }

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all',
      });

      this.logger.log('Event deleted from Google Calendar', { eventId });
      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting event from Google Calendar', { eventId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getEvent(eventId: string): Promise<IntegrationResponse<EventResult>> {
    try {
      if (!this.isFeatureSupported('events')) {
        return { success: false, error: 'Events feature not supported' };
      }

      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });
      
      if (response.data) {
        const result: EventResult = {
          id: response.data.id,
          externalId: response.data.id,
          title: response.data.summary,
          startTime: new Date(response.data.start.dateTime || response.data.start.date),
          endTime: new Date(response.data.end.dateTime || response.data.end.date),
          attendees: response.data.attendees?.map((a: any) => a.email) || [],
          location: response.data.location,
          createdAt: new Date(response.data.created),
          updatedAt: new Date(response.data.updated),
        };

        return { success: true, data: result };
      } else {
        return { success: false, error: 'Failed to get event' };
      }
    } catch (error) {
      this.logger.error('Error getting event from Google Calendar', { eventId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async listEvents(calendarId: string, timeMin?: Date, timeMax?: Date): Promise<IntegrationResponse<EventResult[]>> {
    try {
      if (!this.isFeatureSupported('events')) {
        return { success: false, error: 'Events feature not supported' };
      }

      const params: any = {
        calendarId: calendarId || 'primary',
        timeMin: timeMin?.toISOString(),
        timeMax: timeMax?.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      };

      const response = await this.calendar.events.list(params);
      
      if (response.data && response.data.items) {
        const results: EventResult[] = response.data.items.map((item: any) => ({
          id: item.id,
          externalId: item.id,
          title: item.summary,
          description: item.description,
          startTime: new Date(item.start.dateTime || item.start.date),
          endTime: new Date(item.end.dateTime || item.end.date),
          attendees: item.attendees?.map((a: any) => a.email) || [],
          location: item.location,
          createdAt: new Date(item.created),
          updatedAt: new Date(item.updated),
        }));

        return { success: true, data: results };
      } else {
        return { success: false, error: 'Failed to list events' };
      }
    } catch (error) {
      this.logger.error('Error listing events from Google Calendar', { calendarId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getAvailableSlots(calendarId: string, duration: number, startDate: Date, endDate: Date): Promise<IntegrationResponse<TimeSlotResult[]>> {
    try {
      if (!this.isFeatureSupported('availability')) {
        return { success: false, error: 'Availability feature not supported' };
      }

      // Get busy times for the calendar
      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: calendarId || 'primary' }],
        },
      });

      if (!response.data || !response.data.calendars) {
        return { success: false, error: 'Failed to get availability' };
      }

      const busyTimes = response.data.calendars[calendarId || 'primary']?.busy || [];
      const availableSlots: TimeSlotResult[] = [];

      let currentTime = new Date(startDate);
      const endTime = new Date(endDate);

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000);
        
        if (slotEnd > endTime) break;

        // Check if this slot conflicts with any busy time
        const isAvailable = !busyTimes.some((busy: any) => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return currentTime < busyEnd && slotEnd > busyStart;
        });

        if (isAvailable) {
          availableSlots.push({
            startTime: new Date(currentTime),
            endTime: new Date(slotEnd),
            available: true,
          });
        }

        // Move to next slot (30-minute intervals)
        currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
      }

      return { success: true, data: availableSlots };
    } catch (error) {
      this.logger.error('Error getting available slots from Google Calendar', { 
        calendarId, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  async createCalendar(calendar: CalendarData): Promise<IntegrationResponse<CalendarResult>> {
    try {
      if (!this.isFeatureSupported('calendars')) {
        return { success: false, error: 'Calendars feature not supported' };
      }

      const response = await this.calendar.calendars.insert({
        resource: {
          summary: calendar.name,
          description: calendar.description,
          timeZone: calendar.timezone || 'UTC',
        },
      });

      if (response.data && response.data.id) {
        const result: CalendarResult = {
          id: response.data.id,
          externalId: response.data.id,
          name: calendar.name,
          description: calendar.description,
          timezone: calendar.timezone || 'UTC',
          createdAt: new Date(),
        };

        this.logger.log('Calendar created in Google Calendar', { calendarId: result.id });
        return { success: true, data: result };
      } else {
        return { success: false, error: 'Failed to create calendar' };
      }
    } catch (error) {
      this.logger.error('Error creating calendar in Google Calendar', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Additional Google Calendar-specific methods

  async getCalendarList(): Promise<IntegrationResponse<CalendarResult[]>> {
    try {
      const response = await this.calendar.calendarList.list();
      
      if (response.data && response.data.items) {
        const results: CalendarResult[] = response.data.items.map((item: any) => ({
          id: item.id,
          externalId: item.id,
          name: item.summary,
          description: item.description,
          timezone: item.timeZone,
          createdAt: new Date(item.created || Date.now()),
        }));

        return { success: true, data: results };
      } else {
        return { success: false, error: 'Failed to get calendar list' };
      }
    } catch (error) {
      this.logger.error('Error getting calendar list from Google Calendar', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async addAttendee(eventId: string, email: string): Promise<IntegrationResponse<void>> {
    try {
      const event = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      if (!event.data) {
        return { success: false, error: 'Event not found' };
      }

      const attendees = event.data.attendees || [];
      attendees.push({ email });

      await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: {
          ...event.data,
          attendees,
        },
        sendUpdates: 'all',
      });

      this.logger.log('Attendee added to event in Google Calendar', { eventId, email });
      return { success: true };
    } catch (error) {
      this.logger.error('Error adding attendee to event in Google Calendar', { 
        eventId, 
        email, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  // Private helper methods

  private mapEventToGoogle(event: EventData): any {
    const googleEvent: any = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'UTC',
      },
    };

    if (event.location) {
      googleEvent.location = event.location;
    }

    if (event.attendees && event.attendees.length > 0) {
      googleEvent.attendees = event.attendees.map(email => ({ email }));
    }

    if (event.reminders && event.reminders.length > 0) {
      googleEvent.reminders = {
        useDefault: false,
        overrides: event.reminders.map(reminder => ({
          method: reminder.type === 'email' ? 'email' : 'popup',
          minutes: reminder.minutes,
        })),
      };
    }

    return googleEvent;
  }

  private mergeEventUpdates(currentEvent: any, updates: Partial<EventData>): any {
    const mergedEvent = { ...currentEvent };

    if (updates.title) mergedEvent.summary = updates.title;
    if (updates.description) mergedEvent.description = updates.description;
    if (updates.location) mergedEvent.location = updates.location;

    if (updates.startTime) {
      mergedEvent.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: 'UTC',
      };
    }

    if (updates.endTime) {
      mergedEvent.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: 'UTC',
      };
    }

    if (updates.attendees) {
      mergedEvent.attendees = updates.attendees.map(email => ({ email }));
    }

    return mergedEvent;
  }
}
