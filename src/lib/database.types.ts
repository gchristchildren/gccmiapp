// Generated from the Supabase schema (supabase/migrations). Regenerate after schema changes.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type AppRole = "parent" | "volunteer" | "admin";

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      profiles: Table<
        { id: string; full_name: string; phone: string | null; role: AppRole; skills: string[]; created_at: string },
        { id: string; full_name?: string; phone?: string | null; role?: AppRole; skills?: string[]; created_at?: string }
      >;
      children: Table<
        {
          id: string;
          parent_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          age_group: string;
          medical_notes: string | null;
          photo_consent: boolean;
          created_at: string;
        },
        {
          id?: string;
          parent_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          age_group: string;
          medical_notes?: string | null;
          photo_consent?: boolean;
          created_at?: string;
        }
      >;
      sessions: Table<
        {
          id: string;
          title: string;
          age_group: string;
          starts_at: string;
          ends_at: string | null;
          venue: string;
          memory_verse: string | null;
          lesson_summary: string | null;
          published: boolean;
          created_at: string;
        },
        {
          id?: string;
          title: string;
          age_group: string;
          starts_at: string;
          ends_at?: string | null;
          venue?: string;
          memory_verse?: string | null;
          lesson_summary?: string | null;
          published?: boolean;
          created_at?: string;
        }
      >;
      attendance: Table<
        { session_id: string; child_id: string; present: boolean; marked_at: string },
        { session_id: string; child_id: string; present?: boolean; marked_at?: string }
      >;
      announcements: Table<
        {
          id: string;
          title: string;
          body: string;
          audience: string;
          published: boolean;
          created_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          title: string;
          body: string;
          audience?: string;
          published?: boolean;
          created_by?: string | null;
          created_at?: string;
        }
      >;
      consent_forms: Table<
        {
          id: string;
          title: string;
          description: string | null;
          file_url: string | null;
          required: boolean;
          created_at: string;
        },
        {
          id?: string;
          title: string;
          description?: string | null;
          file_url?: string | null;
          required?: boolean;
          created_at?: string;
        }
      >;
      consent_signatures: Table<
        { form_id: string; child_id: string; signed_by: string; signed_at: string },
        { form_id: string; child_id: string; signed_by: string; signed_at?: string }
      >;
      events: Table<
        {
          id: string;
          slug: string;
          title: string;
          category: string;
          starts_on: string;
          time_label: string;
          venue: string;
          address: string;
          summary: string;
          register_url: string | null;
          published: boolean;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          title: string;
          category: string;
          starts_on: string;
          time_label?: string;
          venue?: string;
          address?: string;
          summary?: string;
          register_url?: string | null;
          published?: boolean;
          created_at?: string;
        }
      >;
      event_registrations: Table<
        { id: string; event_id: string; profile_id: string; attended: boolean | null; created_at: string },
        { id?: string; event_id: string; profile_id: string; attended?: boolean | null; created_at?: string }
      >;
      volunteers: Table<
        {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          skills: string[];
          message: string | null;
          status: string;
          created_at: string;
        },
        {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          skills?: string[];
          message?: string | null;
          status?: string;
          created_at?: string;
        }
      >;
      donations: Table<
        {
          id: string;
          stripe_session_id: string;
          amount_pence: number;
          donation_type: string;
          gift_aid: boolean;
          donor_name: string | null;
          donor_email: string | null;
          created_at: string;
        },
        {
          id?: string;
          stripe_session_id: string;
          amount_pence: number;
          donation_type: string;
          gift_aid?: boolean;
          donor_name?: string | null;
          donor_email?: string | null;
          created_at?: string;
        }
      >;
      push_subscriptions: Table<
        { id: string; profile_id: string; endpoint: string; p256dh: string; auth: string; created_at: string },
        { id?: string; profile_id: string; endpoint: string; p256dh: string; auth: string; created_at?: string }
      >;
      notifications: Table<
        {
          id: string;
          title: string;
          body: string;
          url: string | null;
          kind: "announcement" | "reminder" | "event" | "opportunity" | "manual";
          sent_count: number;
          created_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          title: string;
          body: string;
          url?: string | null;
          kind: "announcement" | "reminder" | "event" | "opportunity" | "manual";
          sent_count?: number;
          created_by?: string | null;
          created_at?: string;
        }
      >;
      reminder_log: Table<{ key: string; sent_at: string }, { key: string; sent_at?: string }>;
      volunteer_opportunities: Table<
        {
          id: string;
          title: string;
          description: string;
          skills: string[];
          event_id: string | null;
          starts_on: string | null;
          published: boolean;
          created_at: string;
        },
        {
          id?: string;
          title: string;
          description?: string;
          skills?: string[];
          event_id?: string | null;
          starts_on?: string | null;
          published?: boolean;
          created_at?: string;
        }
      >;
      opportunity_signups: Table<
        { opportunity_id: string; profile_id: string; created_at: string },
        { opportunity_id: string; profile_id: string; created_at?: string }
      >;
      courses: Table<
        {
          id: string;
          slug: string;
          title: string;
          description: string;
          schedule_note: string;
          starts_on: string | null;
          published: boolean;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          title: string;
          description?: string;
          schedule_note?: string;
          starts_on?: string | null;
          published?: boolean;
          created_at?: string;
        }
      >;
      lessons: Table<
        {
          id: string;
          course_id: string;
          position: number;
          title: string;
          description: string;
          video_url: string | null;
          created_at: string;
        },
        {
          id?: string;
          course_id: string;
          position?: number;
          title: string;
          description?: string;
          video_url?: string | null;
          created_at?: string;
        }
      >;
      course_resources: Table<
        { id: string; course_id: string; title: string; file_url: string; created_at: string },
        { id?: string; course_id: string; title: string; file_url: string; created_at?: string }
      >;
      masterclass_memberships: Table<
        { id: string; profile_id: string; year: number; status: "pending" | "active" | "cancelled"; created_at: string },
        { id?: string; profile_id: string; year: number; status?: "pending" | "active" | "cancelled"; created_at?: string }
      >;
      lesson_progress: Table<
        { profile_id: string; lesson_id: string; completed_at: string },
        { profile_id: string; lesson_id: string; completed_at?: string }
      >;
      certificates: Table<
        { id: string; certificate_no: string; profile_id: string; course_id: string; holder_name: string; issued_at: string },
        { id?: string; certificate_no?: string; profile_id: string; course_id: string; holder_name: string; issued_at?: string }
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { app_role: AppRole };
    CompositeTypes: { [_ in never]: never };
  };
};
