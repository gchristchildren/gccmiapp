// Generated from the Supabase schema (supabase/migrations). Regenerate after schema changes.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type RefereeStatus = "not contacted" | "requested" | "received" | "declined";
export type Referee = { name: string; relationship: string; email: string; phone: string; status: RefereeStatus };

export type AppRole = "parent" | "volunteer" | "admin";

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      profiles: Table<
        { id: string; full_name: string; phone: string | null; country: string | null; email: string | null; role: AppRole; skills: string[]; email_updates: boolean; created_at: string },
        { id: string; full_name?: string; phone?: string | null; country?: string | null; email?: string | null; role?: AppRole; skills?: string[]; email_updates?: boolean; created_at?: string }
      >;
      export_log: Table<
        { id: string; admin_id: string | null; kind: "emails" | "full"; filter: Json; row_count: number; created_at: string },
        { id?: string; admin_id?: string | null; kind: "emails" | "full"; filter?: Json; row_count: number; created_at?: string }
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
          photo_website: boolean;
          photo_social: boolean;
          photo_print: boolean;
          photo_funding: boolean;
          consent_at: string | null;
          consent_version: string | null;
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
          photo_website?: boolean;
          photo_social?: boolean;
          photo_print?: boolean;
          photo_funding?: boolean;
          consent_at?: string | null;
          consent_version?: string | null;
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
          referees: Referee[];
          vetting_complete: boolean;
          vetting_notes: string | null;
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
          referees?: Referee[];
          vetting_complete?: boolean;
          vetting_notes?: string | null;
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
      posts: Table<
        {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          body: string;
          cover_url: string | null;
          published: boolean;
          published_at: string;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string;
          body?: string;
          cover_url?: string | null;
          published?: boolean;
          published_at?: string;
          created_at?: string;
        }
      >;
      masterclass_interest: Table<
        { course_id: string; profile_id: string; status: "interested" | "approved" | "declined"; created_at: string },
        { course_id: string; profile_id: string; status?: "interested" | "approved" | "declined"; created_at?: string }
      >;
      course_links: Table<
        { course_id: string; kind: "live" | "replay"; url: string },
        { course_id: string; kind: "live" | "replay"; url: string }
      >;
      event_media: Table<
        { id: string; event_id: string; kind: "image" | "video" | "embed"; path: string | null; thumb_path: string | null; embed_url: string | null; caption: string | null; created_at: string },
        { id?: string; event_id: string; kind: "image" | "video" | "embed"; path?: string | null; thumb_path?: string | null; embed_url?: string | null; caption?: string | null; created_at?: string }
      >;
      app_settings: Table<
        { key: string; value: string; updated_at: string },
        { key: string; value: string; updated_at?: string }
      >;
      session_links: Table<
        { session_id: string; zoom_url: string; created_at: string },
        { session_id: string; zoom_url: string; created_at?: string }
      >;
      quiz_scores: Table<
        { id: string; child_id: string; quiz_title: string; score: number; out_of: number; taken_on: string; created_at: string },
        { id?: string; child_id: string; quiz_title: string; score: number; out_of: number; taken_on?: string; created_at?: string }
      >;
      assignments: Table<
        { id: string; child_id: string; profile_id: string; file_path: string; file_name: string; file_size: number; note: string | null; created_at: string },
        { id?: string; child_id: string; profile_id: string; file_path: string; file_name: string; file_size: number; note?: string | null; created_at?: string }
      >;
      contact_messages: Table<
        { id: string; name: string; email: string; message: string; status: "new" | "replied"; created_at: string },
        { id?: string; name: string; email: string; message: string; status?: "new" | "replied"; created_at?: string }
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
          kind: "course" | "live" | "replay";
          event_at: string | null;
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
          kind?: "course" | "live" | "replay";
          event_at?: string | null;
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
    Functions: {
      admin_delete_family: { Args: { target: string }; Returns: undefined };
      admin_parent_stats: { Args: Record<string, never>; Returns: { profile_id: string; last_sign_in_at: string | null; push_on: boolean }[] };
    };
    Enums: { app_role: AppRole };
    CompositeTypes: { [_ in never]: never };
  };
};
