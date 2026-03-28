export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_denied_logs: {
        Row: {
          attempted_permission: string
          attempted_route: string
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempted_permission: string
          attempted_route: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempted_permission?: string
          attempted_route?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      activation_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_certifications: {
        Row: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          coach_id: string
          created_at: string
          expiration_date: string | null
          id: string
          issued_date: string | null
          last_score: number | null
          org_id: string
          status: Database["public"]["Enums"]["admin_cert_status"]
          updated_at: string
        }
        Insert: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          coach_id: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          last_score?: number | null
          org_id: string
          status?: Database["public"]["Enums"]["admin_cert_status"]
          updated_at?: string
        }
        Update: {
          cert_type?: Database["public"]["Enums"]["admin_cert_type"]
          coach_id?: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          last_score?: number | null
          org_id?: string
          status?: Database["public"]["Enums"]["admin_cert_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_certifications_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_exam_attempts: {
        Row: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          coach_id: string
          created_at: string
          duration_seconds: number | null
          id: string
          org_id: string
          pass_fail: boolean
          score: number
        }
        Insert: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          coach_id: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          org_id: string
          pass_fail: boolean
          score: number
        }
        Update: {
          cert_type?: Database["public"]["Enums"]["admin_cert_type"]
          coach_id?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          org_id?: string
          pass_fail?: boolean
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_exam_attempts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      arm_care_logs: {
        Row: {
          arm_feeling: number | null
          band_work_minutes: number | null
          created_at: string
          exercises_completed: Json | null
          icing_minutes: number | null
          id: string
          log_date: string
          notes: string | null
          rom_score: number | null
          stretching_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arm_feeling?: number | null
          band_work_minutes?: number | null
          created_at?: string
          exercises_completed?: Json | null
          icing_minutes?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          rom_score?: number | null
          stretching_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arm_feeling?: number | null
          band_work_minutes?: number | null
          created_at?: string
          exercises_completed?: Json | null
          icing_minutes?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          rom_score?: number | null
          stretching_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_22m_invite_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          max_uses: number | null
          token: string
          used_count: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          max_uses?: number | null
          token?: string
          used_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          max_uses?: number | null
          token?: string
          used_count?: number | null
        }
        Relationships: []
      }
      athlete_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          energy_level: number | null
          id: string
          mood: number | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          soreness_level: number | null
          stress_level: number | null
          training_completed: boolean | null
          training_duration_minutes: number | null
          training_intensity: number | null
          training_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness_level?: number | null
          stress_level?: number | null
          training_completed?: boolean | null
          training_duration_minutes?: number | null
          training_intensity?: number | null
          training_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness_level?: number | null
          stress_level?: number | null
          training_completed?: boolean | null
          training_duration_minutes?: number | null
          training_intensity?: number | null
          training_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_development_scores: {
        Row: {
          athletic_metrics: number
          calculated_at: string
          compliance_score: number | null
          consistency_score: number | null
          created_at: string
          feedback_count: number
          gaps_summary: string[] | null
          homework_completed: number
          homework_total: number
          id: string
          improvement_status: string | null
          lessons_attended: number
          lessons_missed: number
          overall_score: number
          period_end: string
          period_start: string
          readiness_score: number | null
          skill_development: number
          sport_type: string | null
          strengths_summary: string[] | null
          top_priorities: string[] | null
          training_consistency: number
          user_id: string
          weekly_focus: string | null
          work_ethic: number
          workload_score: number | null
        }
        Insert: {
          athletic_metrics?: number
          calculated_at?: string
          compliance_score?: number | null
          consistency_score?: number | null
          created_at?: string
          feedback_count?: number
          gaps_summary?: string[] | null
          homework_completed?: number
          homework_total?: number
          id?: string
          improvement_status?: string | null
          lessons_attended?: number
          lessons_missed?: number
          overall_score?: number
          period_end?: string
          period_start?: string
          readiness_score?: number | null
          skill_development?: number
          sport_type?: string | null
          strengths_summary?: string[] | null
          top_priorities?: string[] | null
          training_consistency?: number
          user_id: string
          weekly_focus?: string | null
          work_ethic?: number
          workload_score?: number | null
        }
        Update: {
          athletic_metrics?: number
          calculated_at?: string
          compliance_score?: number | null
          consistency_score?: number | null
          created_at?: string
          feedback_count?: number
          gaps_summary?: string[] | null
          homework_completed?: number
          homework_total?: number
          id?: string
          improvement_status?: string | null
          lessons_attended?: number
          lessons_missed?: number
          overall_score?: number
          period_end?: string
          period_start?: string
          readiness_score?: number | null
          skill_development?: number
          sport_type?: string | null
          strengths_summary?: string[] | null
          top_priorities?: string[] | null
          training_consistency?: number
          user_id?: string
          weekly_focus?: string | null
          work_ethic?: number
          workload_score?: number | null
        }
        Relationships: []
      }
      athlete_kpi_goals: {
        Row: {
          achieved_at: string | null
          created_at: string
          id: string
          is_achieved: boolean | null
          kpi_category: string
          kpi_name: string
          kpi_unit: string | null
          notes: string | null
          target_date: string | null
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string
          id?: string
          is_achieved?: boolean | null
          kpi_category: string
          kpi_name: string
          kpi_unit?: string | null
          notes?: string | null
          target_date?: string | null
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string
          id?: string
          is_achieved?: boolean | null
          kpi_category?: string
          kpi_name?: string
          kpi_unit?: string | null
          notes?: string | null
          target_date?: string | null
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_kpis: {
        Row: {
          created_at: string
          id: string
          kpi_category: string
          kpi_name: string
          kpi_unit: string | null
          kpi_value: number
          notes: string | null
          recorded_at: string
          recorded_by: string | null
          session_id: string | null
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kpi_category: string
          kpi_name: string
          kpi_unit?: string | null
          kpi_value: number
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          session_id?: string | null
          source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kpi_category?: string
          kpi_name?: string
          kpi_unit?: string | null
          kpi_value?: number
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          session_id?: string | null
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_onboarding: {
        Row: {
          age: number | null
          athlete_goals: string | null
          athlete_name: string | null
          biggest_struggle: string | null
          created_at: string
          current_level: string | null
          current_velocity: string | null
          email: string
          exit_velo: string | null
          id: string
          parent_name: string | null
          position: string | null
          product_purchased: string | null
          sixty_time: string | null
          social_handle: string | null
          training_history: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age?: number | null
          athlete_goals?: string | null
          athlete_name?: string | null
          biggest_struggle?: string | null
          created_at?: string
          current_level?: string | null
          current_velocity?: string | null
          email: string
          exit_velo?: string | null
          id?: string
          parent_name?: string | null
          position?: string | null
          product_purchased?: string | null
          sixty_time?: string | null
          social_handle?: string | null
          training_history?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number | null
          athlete_goals?: string | null
          athlete_name?: string | null
          biggest_struggle?: string | null
          created_at?: string
          current_level?: string | null
          current_velocity?: string | null
          email?: string
          exit_velo?: string | null
          id?: string
          parent_name?: string | null
          position?: string | null
          product_purchased?: string | null
          sixty_time?: string | null
          social_handle?: string | null
          training_history?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      athlete_progress_reports: {
        Row: {
          ai_accuracy_notes: string | null
          ai_projections: Json | null
          ai_recommendations: Json | null
          ai_summary: string | null
          areas_of_improvement: string | null
          athlete_user_id: string
          athlete_viewed_at: string | null
          bat_speed: Json | null
          coach_notes: string | null
          coach_user_id: string
          created_at: string
          delivered_at: string | null
          exit_velocity: Json | null
          id: string
          is_published: boolean | null
          parent_viewed_at: string | null
          pitch_velocity: Json | null
          pop_time: Json | null
          report_period: string | null
          report_title: string
          share_token: string | null
          sprint_speed: Json | null
          strengths_observed: string | null
          updated_at: string
        }
        Insert: {
          ai_accuracy_notes?: string | null
          ai_projections?: Json | null
          ai_recommendations?: Json | null
          ai_summary?: string | null
          areas_of_improvement?: string | null
          athlete_user_id: string
          athlete_viewed_at?: string | null
          bat_speed?: Json | null
          coach_notes?: string | null
          coach_user_id: string
          created_at?: string
          delivered_at?: string | null
          exit_velocity?: Json | null
          id?: string
          is_published?: boolean | null
          parent_viewed_at?: string | null
          pitch_velocity?: Json | null
          pop_time?: Json | null
          report_period?: string | null
          report_title?: string
          share_token?: string | null
          sprint_speed?: Json | null
          strengths_observed?: string | null
          updated_at?: string
        }
        Update: {
          ai_accuracy_notes?: string | null
          ai_projections?: Json | null
          ai_recommendations?: Json | null
          ai_summary?: string | null
          areas_of_improvement?: string | null
          athlete_user_id?: string
          athlete_viewed_at?: string | null
          bat_speed?: Json | null
          coach_notes?: string | null
          coach_user_id?: string
          created_at?: string
          delivered_at?: string | null
          exit_velocity?: Json | null
          id?: string
          is_published?: boolean | null
          parent_viewed_at?: string | null
          pitch_velocity?: Json | null
          pop_time?: Json | null
          report_period?: string | null
          report_title?: string
          share_token?: string | null
          sprint_speed?: Json | null
          strengths_observed?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      athlete_trials: {
        Row: {
          converted_at: string | null
          converted_product: string | null
          created_at: string
          extended_at: string | null
          extended_by: string | null
          id: string
          invite_token_id: string | null
          notes: string | null
          trial_active: boolean | null
          trial_end_date: string
          trial_start_date: string
          trial_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          converted_at?: string | null
          converted_product?: string | null
          created_at?: string
          extended_at?: string | null
          extended_by?: string | null
          id?: string
          invite_token_id?: string | null
          notes?: string | null
          trial_active?: boolean | null
          trial_end_date?: string
          trial_start_date?: string
          trial_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          converted_at?: string | null
          converted_product?: string | null
          created_at?: string
          extended_at?: string | null
          extended_by?: string | null
          id?: string
          invite_token_id?: string | null
          notes?: string | null
          trial_active?: boolean | null
          trial_end_date?: string
          trial_start_date?: string
          trial_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_trials_invite_token_id_fkey"
            columns: ["invite_token_id"]
            isOneToOne: false
            referencedRelation: "athlete_22m_invite_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      athletic_stats: {
        Row: {
          created_at: string
          id: string
          privacy_level: string
          season: string | null
          stat_name: string
          stat_type: string
          stat_value: string
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          privacy_level?: string
          season?: string | null
          stat_name: string
          stat_type: string
          stat_value: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          privacy_level?: string
          season?: string | null
          stat_name?: string
          stat_type?: string
          stat_value?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      certification_attempts: {
        Row: {
          answers: Json
          certification_type: Database["public"]["Enums"]["certification_type"]
          completed_at: string | null
          created_at: string
          id: string
          passed: boolean | null
          question_ids: string[]
          score: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          certification_type: Database["public"]["Enums"]["certification_type"]
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean | null
          question_ids?: string[]
          score?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          certification_type?: Database["public"]["Enums"]["certification_type"]
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean | null
          question_ids?: string[]
          score?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      certification_definitions: {
        Row: {
          certification_type: Database["public"]["Enums"]["certification_type"]
          created_at: string
          description: string | null
          id: string
          is_required: boolean
          name: string
          passing_score: number
          prerequisites:
            | Database["public"]["Enums"]["certification_type"][]
            | null
          price_cents: number
          question_count: number
          updated_at: string
          validity_months: number
        }
        Insert: {
          certification_type: Database["public"]["Enums"]["certification_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name: string
          passing_score?: number
          prerequisites?:
            | Database["public"]["Enums"]["certification_type"][]
            | null
          price_cents?: number
          question_count?: number
          updated_at?: string
          validity_months?: number
        }
        Update: {
          certification_type?: Database["public"]["Enums"]["certification_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name?: string
          passing_score?: number
          prerequisites?:
            | Database["public"]["Enums"]["certification_type"][]
            | null
          price_cents?: number
          question_count?: number
          updated_at?: string
          validity_months?: number
        }
        Relationships: []
      }
      certification_questions: {
        Row: {
          certification_type: Database["public"]["Enums"]["certification_type"]
          correct_answer_index: number
          created_at: string
          display_order: number
          explanation: string | null
          id: string
          is_active: boolean
          is_scenario: boolean | null
          options: Json
          question_text: string
          section: string
          updated_at: string
        }
        Insert: {
          certification_type: Database["public"]["Enums"]["certification_type"]
          correct_answer_index: number
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          is_active?: boolean
          is_scenario?: boolean | null
          options?: Json
          question_text: string
          section: string
          updated_at?: string
        }
        Update: {
          certification_type?: Database["public"]["Enums"]["certification_type"]
          correct_answer_index?: number
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          is_active?: boolean
          is_scenario?: boolean | null
          options?: Json
          question_text?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_alerts: {
        Row: {
          alert_type: string
          athlete_user_id: string
          coach_user_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
        }
        Insert: {
          alert_type: string
          athlete_user_id: string
          coach_user_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
        }
        Update: {
          alert_type?: string
          athlete_user_id?: string
          coach_user_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
        }
        Relationships: []
      }
      coach_athlete_assignments: {
        Row: {
          approval_requested_at: string | null
          approved_at: string | null
          athlete_approved: boolean | null
          athlete_user_id: string
          coach_user_id: string
          created_at: string
          id: string
          is_active: boolean
        }
        Insert: {
          approval_requested_at?: string | null
          approved_at?: string | null
          athlete_approved?: boolean | null
          athlete_user_id: string
          coach_user_id: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Update: {
          approval_requested_at?: string | null
          approved_at?: string | null
          athlete_approved?: boolean | null
          athlete_user_id?: string
          coach_user_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      coach_availability: {
        Row: {
          coach_user_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
        }
        Insert: {
          coach_user_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
        }
        Update: {
          coach_user_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
        }
        Relationships: []
      }
      coach_badges: {
        Row: {
          badge_level: Database["public"]["Enums"]["badge_level"]
          badge_name: string
          badge_status: string
          certification_score: number | null
          compliance_status: string | null
          created_at: string | null
          earned_at: string | null
          expires_at: string | null
          id: string
          kpi_validated: boolean | null
          last_validated_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_level: Database["public"]["Enums"]["badge_level"]
          badge_name: string
          badge_status?: string
          certification_score?: number | null
          compliance_status?: string | null
          created_at?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          kpi_validated?: boolean | null
          last_validated_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_level?: Database["public"]["Enums"]["badge_level"]
          badge_name?: string
          badge_status?: string
          certification_score?: number | null
          compliance_status?: string | null
          created_at?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          kpi_validated?: boolean | null
          last_validated_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coach_invite_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          max_uses: number | null
          token: string
          used_count: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          max_uses?: number | null
          token?: string
          used_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          max_uses?: number | null
          token?: string
          used_count?: number | null
        }
        Relationships: []
      }
      coach_kpi_comments: {
        Row: {
          athlete_user_id: string
          coach_user_id: string
          comment: string
          created_at: string
          id: string
          kpi_category: string
          kpi_name: string
          updated_at: string
        }
        Insert: {
          athlete_user_id: string
          coach_user_id: string
          comment: string
          created_at?: string
          id?: string
          kpi_category: string
          kpi_name: string
          updated_at?: string
        }
        Update: {
          athlete_user_id?: string
          coach_user_id?: string
          comment?: string
          created_at?: string
          id?: string
          kpi_category?: string
          kpi_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_lesson_feedback: {
        Row: {
          ai_generated_at: string | null
          ai_homework: Json | null
          ai_recommended_drills: Json | null
          ai_summary: string | null
          areas_for_improvement: string | null
          athlete_user_id: string
          coach_user_id: string
          created_at: string | null
          delivered_at: string | null
          delivered_to_athlete: boolean | null
          id: string
          lesson_focus: string | null
          lesson_id: string
          next_development_focus: string | null
          recommended_drills: Json | null
          sport_type: string
          strengths_observed: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          ai_generated_at?: string | null
          ai_homework?: Json | null
          ai_recommended_drills?: Json | null
          ai_summary?: string | null
          areas_for_improvement?: string | null
          athlete_user_id: string
          coach_user_id: string
          created_at?: string | null
          delivered_at?: string | null
          delivered_to_athlete?: boolean | null
          id?: string
          lesson_focus?: string | null
          lesson_id: string
          next_development_focus?: string | null
          recommended_drills?: Json | null
          sport_type?: string
          strengths_observed?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_generated_at?: string | null
          ai_homework?: Json | null
          ai_recommended_drills?: Json | null
          ai_summary?: string | null
          areas_for_improvement?: string | null
          athlete_user_id?: string
          coach_user_id?: string
          created_at?: string | null
          delivered_at?: string | null
          delivered_to_athlete?: boolean | null
          id?: string
          lesson_focus?: string | null
          lesson_id?: string
          next_development_focus?: string | null
          recommended_drills?: Json | null
          sport_type?: string
          strengths_observed?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coach_marketplace_profiles: {
        Row: {
          avg_rating: number | null
          bio: string | null
          coach_id: string
          coaching_background: string | null
          created_at: string | null
          hourly_rate_cents: number | null
          id: string
          is_marketplace_active: boolean | null
          location: string | null
          photo_url: string | null
          playing_background: string | null
          specialties: string[] | null
          tagline: string | null
          total_reviews: number | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          avg_rating?: number | null
          bio?: string | null
          coach_id: string
          coaching_background?: string | null
          created_at?: string | null
          hourly_rate_cents?: number | null
          id?: string
          is_marketplace_active?: boolean | null
          location?: string | null
          photo_url?: string | null
          playing_background?: string | null
          specialties?: string[] | null
          tagline?: string | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          avg_rating?: number | null
          bio?: string | null
          coach_id?: string
          coaching_background?: string | null
          created_at?: string | null
          hourly_rate_cents?: number | null
          id?: string
          is_marketplace_active?: boolean | null
          location?: string | null
          photo_url?: string | null
          playing_background?: string | null
          specialties?: string[] | null
          tagline?: string | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_marketplace_profiles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_onboarding: {
        Row: {
          completed_at: string | null
          connected_athletes: boolean | null
          created_at: string
          created_schedule: boolean | null
          id: string
          reviewed_dashboard: boolean | null
          setup_profile: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connected_athletes?: boolean | null
          created_at?: string
          created_schedule?: boolean | null
          id?: string
          reviewed_dashboard?: boolean | null
          setup_profile?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connected_athletes?: boolean | null
          created_at?: string
          created_schedule?: boolean | null
          id?: string
          reviewed_dashboard?: boolean | null
          setup_profile?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_payouts: {
        Row: {
          amount_cents: number
          coach_id: string
          created_at: string
          currency: string
          description: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          coach_id: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          coach_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_payouts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_recommendations: {
        Row: {
          athlete_user_id: string
          coach_user_id: string
          created_at: string
          id: string
          is_attached_to_profile: boolean | null
          recommendation_text: string
          written_at: string
        }
        Insert: {
          athlete_user_id: string
          coach_user_id: string
          created_at?: string
          id?: string
          is_attached_to_profile?: boolean | null
          recommendation_text: string
          written_at?: string
        }
        Update: {
          athlete_user_id?: string
          coach_user_id?: string
          created_at?: string
          id?: string
          is_attached_to_profile?: boolean | null
          recommendation_text?: string
          written_at?: string
        }
        Relationships: []
      }
      coach_registration_requests: {
        Row: {
          coaching_experience: string | null
          created_at: string
          email: string
          experience_years: number | null
          full_name: string
          id: string
          invite_token_id: string | null
          location: string | null
          message: string | null
          organization: string | null
          phone: string | null
          playing_experience: string | null
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_media: string | null
          specialization: string | null
          specialties: string[] | null
          status: string
          updated_at: string
          user_id: string
          video_sample_url: string | null
        }
        Insert: {
          coaching_experience?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          invite_token_id?: string | null
          location?: string | null
          message?: string | null
          organization?: string | null
          phone?: string | null
          playing_experience?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media?: string | null
          specialization?: string | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
          video_sample_url?: string | null
        }
        Update: {
          coaching_experience?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          invite_token_id?: string | null
          location?: string | null
          message?: string | null
          organization?: string | null
          phone?: string | null
          playing_experience?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media?: string | null
          specialization?: string | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
          video_sample_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_registration_requests_invite_token_id_fkey"
            columns: ["invite_token_id"]
            isOneToOne: false
            referencedRelation: "coach_invite_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_reviews: {
        Row: {
          athlete_user_id: string
          booking_id: string
          coach_id: string
          created_at: string | null
          id: string
          rating: number
          review_text: string | null
        }
        Insert: {
          athlete_user_id: string
          booking_id: string
          coach_id: string
          created_at?: string | null
          id?: string
          rating: number
          review_text?: string | null
        }
        Update: {
          athlete_user_id?: string
          booking_id?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "marketplace_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_reviews_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_services: {
        Row: {
          coach_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          price_cents: number
          service_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price_cents: number
          service_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price_cents?: number
          service_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_services_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          approved_by_admin: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          is_bypass_certified: boolean
          is_certified: boolean
          is_marketplace_approved: boolean
          is_staff: boolean
          location: string | null
          marketplace_status: string
          name: string
          org_id: string
          role: Database["public"]["Enums"]["coach_role"]
          specialties: string[] | null
          status: Database["public"]["Enums"]["coach_status"]
          stripe_account_id: string | null
          team_id: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          approved_by_admin?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          is_bypass_certified?: boolean
          is_certified?: boolean
          is_marketplace_approved?: boolean
          is_staff?: boolean
          location?: string | null
          marketplace_status?: string
          name: string
          org_id: string
          role?: Database["public"]["Enums"]["coach_role"]
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["coach_status"]
          stripe_account_id?: string | null
          team_id?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          approved_by_admin?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          is_bypass_certified?: boolean
          is_certified?: boolean
          is_marketplace_approved?: boolean
          is_staff?: boolean
          location?: string | null
          marketplace_status?: string
          name?: string
          org_id?: string
          role?: Database["public"]["Enums"]["coach_role"]
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["coach_status"]
          stripe_account_id?: string | null
          team_id?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      coaching_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          coach_name: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          session_date: string
          session_time: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_name?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          session_date: string
          session_time: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_name?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          session_date?: string
          session_time?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          flag_reason: string | null
          flagged_at: string | null
          flagged_by: string | null
          hidden_by_admin: boolean
          id: string
          is_flagged: boolean
          media_url: string | null
          moderation_notes: string | null
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          hidden_by_admin?: boolean
          id?: string
          is_flagged?: boolean
          media_url?: string | null
          moderation_notes?: string | null
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          hidden_by_admin?: boolean
          id?: string
          is_flagged?: boolean
          media_url?: string | null
          moderation_notes?: string | null
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_access_logs: {
        Row: {
          accessed_at: string
          content_id: string
          content_type: string
          id: string
          ip_hash: string | null
          module_name: string | null
          session_id: string | null
          sport_type: string | null
          user_id: string
        }
        Insert: {
          accessed_at?: string
          content_id: string
          content_type: string
          id?: string
          ip_hash?: string | null
          module_name?: string | null
          session_id?: string | null
          sport_type?: string | null
          user_id: string
        }
        Update: {
          accessed_at?: string
          content_id?: string
          content_type?: string
          id?: string
          ip_hash?: string | null
          module_name?: string | null
          session_id?: string | null
          sport_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_submissions: {
        Row: {
          age_group: string | null
          coaching_points: string | null
          content_data: Json | null
          content_type: string
          created_at: string
          created_by: string
          description: string | null
          difficulty: string | null
          id: string
          published_at: string | null
          rejection_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          revision_note: string | null
          skill_category: string | null
          sport_type: string
          status: string
          submitted_at: string | null
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          age_group?: string | null
          coaching_points?: string | null
          content_data?: Json | null
          content_type: string
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: string | null
          id?: string
          published_at?: string | null
          rejection_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_note?: string | null
          skill_category?: string | null
          sport_type?: string
          status?: string
          submitted_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          age_group?: string | null
          coaching_points?: string | null
          content_data?: Json | null
          content_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          published_at?: string | null
          rejection_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_note?: string | null
          skill_category?: string | null
          sport_type?: string
          status?: string
          submitted_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      course_certificates: {
        Row: {
          certificate_number: string
          completion_date: string
          course_id: string
          course_title: string
          created_at: string
          id: string
          issued_at: string
          recipient_name: string
          user_id: string
        }
        Insert: {
          certificate_number?: string
          completion_date: string
          course_id: string
          course_title: string
          created_at?: string
          id?: string
          issued_at?: string
          recipient_name: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          completion_date?: string
          course_id?: string
          course_title?: string
          created_at?: string
          id?: string
          issued_at?: string
          recipient_name?: string
          user_id?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          last_accessed_at: string | null
          progress_percent: number
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percent?: number
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percent?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_index: number
          module_index: number
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_index: number
          module_index: number
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_index?: number
          module_index?: number
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_videos: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          id: string
          is_preview: boolean
          lesson_id: string
          module_id: string
          sport_type: string | null
          updated_at: string
          video_platform: string | null
          video_url: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_preview?: boolean
          lesson_id: string
          module_id: string
          sport_type?: string | null
          updated_at?: string
          video_platform?: string | null
          video_url: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_preview?: boolean
          lesson_id?: string
          module_id?: string
          sport_type?: string | null
          updated_at?: string
          video_platform?: string | null
          video_url?: string
        }
        Relationships: []
      }
      custom_training_schedules: {
        Row: {
          coach_user_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          position: string | null
          schedule_data: Json
          training_phase: string | null
          updated_at: string
        }
        Insert: {
          coach_user_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          position?: string | null
          schedule_data?: Json
          training_phase?: string | null
          updated_at?: string
        }
        Update: {
          coach_user_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: string | null
          schedule_data?: Json
          training_phase?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          requested_at: string
          status: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      data_retention_config: {
        Row: {
          config_key: string
          config_value: Json
          description: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      development_recommendations: {
        Row: {
          approved_by: string | null
          athlete_user_id: string
          created_at: string
          id: string
          metadata: Json | null
          priority: string | null
          reason: string | null
          recommendation_type: string
          resolved_at: string | null
          source_outcome_ids: string[] | null
          sport_type: string
          status: string
          title: string
        }
        Insert: {
          approved_by?: string | null
          athlete_user_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          reason?: string | null
          recommendation_type: string
          resolved_at?: string | null
          source_outcome_ids?: string[] | null
          sport_type?: string
          status?: string
          title: string
        }
        Update: {
          approved_by?: string | null
          athlete_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          reason?: string | null
          recommendation_type?: string
          resolved_at?: string | null
          source_outcome_ids?: string[] | null
          sport_type?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      device_integrations: {
        Row: {
          access_token: string | null
          api_key: string | null
          api_secret: string | null
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"]
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string
          device_type: Database["public"]["Enums"]["device_type"]
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_metrics: {
        Row: {
          attack_angle: number | null
          bat_speed_mph: number | null
          body_rotation: number | null
          connection_score: number | null
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"]
          distance_ft: number | null
          exit_velocity_mph: number | null
          horizontal_break: number | null
          id: string
          import_source: string | null
          launch_angle: number | null
          measured_velocity_mph: number | null
          metric_category: string
          notes: string | null
          on_plane_efficiency: number | null
          peak_hand_speed: number | null
          pitch_type: string | null
          power_index: number | null
          raw_data: Json | null
          recorded_at: string
          release_extension: number | null
          release_height: number | null
          rotation_score: number | null
          session_id: string | null
          spin_axis: number | null
          spin_efficiency: number | null
          spin_rate_rpm: number | null
          time_to_contact: number | null
          updated_at: string
          user_id: string
          velocity_mph: number | null
          velocity_type: string | null
          vertical_break: number | null
        }
        Insert: {
          attack_angle?: number | null
          bat_speed_mph?: number | null
          body_rotation?: number | null
          connection_score?: number | null
          created_at?: string
          device_type: Database["public"]["Enums"]["device_type"]
          distance_ft?: number | null
          exit_velocity_mph?: number | null
          horizontal_break?: number | null
          id?: string
          import_source?: string | null
          launch_angle?: number | null
          measured_velocity_mph?: number | null
          metric_category: string
          notes?: string | null
          on_plane_efficiency?: number | null
          peak_hand_speed?: number | null
          pitch_type?: string | null
          power_index?: number | null
          raw_data?: Json | null
          recorded_at?: string
          release_extension?: number | null
          release_height?: number | null
          rotation_score?: number | null
          session_id?: string | null
          spin_axis?: number | null
          spin_efficiency?: number | null
          spin_rate_rpm?: number | null
          time_to_contact?: number | null
          updated_at?: string
          user_id: string
          velocity_mph?: number | null
          velocity_type?: string | null
          vertical_break?: number | null
        }
        Update: {
          attack_angle?: number | null
          bat_speed_mph?: number | null
          body_rotation?: number | null
          connection_score?: number | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          distance_ft?: number | null
          exit_velocity_mph?: number | null
          horizontal_break?: number | null
          id?: string
          import_source?: string | null
          launch_angle?: number | null
          measured_velocity_mph?: number | null
          metric_category?: string
          notes?: string | null
          on_plane_efficiency?: number | null
          peak_hand_speed?: number | null
          pitch_type?: string | null
          power_index?: number | null
          raw_data?: Json | null
          recorded_at?: string
          release_extension?: number | null
          release_height?: number | null
          rotation_score?: number | null
          session_id?: string | null
          spin_axis?: number | null
          spin_efficiency?: number | null
          spin_rate_rpm?: number | null
          time_to_contact?: number | null
          updated_at?: string
          user_id?: string
          velocity_mph?: number | null
          velocity_type?: string | null
          vertical_break?: number | null
        }
        Relationships: []
      }
      device_registry: {
        Row: {
          api_type: string | null
          capabilities: string[]
          created_at: string
          data_fields: Json | null
          description: string | null
          device_category: string
          device_key: string
          device_name: string
          id: string
          integration_status: string
          is_active: boolean | null
          logo_emoji: string | null
          manufacturer: string
          priority_order: number | null
        }
        Insert: {
          api_type?: string | null
          capabilities?: string[]
          created_at?: string
          data_fields?: Json | null
          description?: string | null
          device_category?: string
          device_key: string
          device_name: string
          id?: string
          integration_status?: string
          is_active?: boolean | null
          logo_emoji?: string | null
          manufacturer: string
          priority_order?: number | null
        }
        Update: {
          api_type?: string | null
          capabilities?: string[]
          created_at?: string
          data_fields?: Json | null
          description?: string | null
          device_category?: string
          device_key?: string
          device_name?: string
          id?: string
          integration_status?: string
          is_active?: boolean | null
          logo_emoji?: string | null
          manufacturer?: string
          priority_order?: number | null
        }
        Relationships: []
      }
      device_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          device_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          records_failed: number | null
          records_imported: number | null
          started_at: string
          sync_status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          device_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_failed?: number | null
          records_imported?: number | null
          started_at?: string
          sync_status?: string
          sync_type?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          device_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_failed?: number | null
          records_imported?: number | null
          started_at?: string
          sync_status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: []
      }
      dpflex_lineups: {
        Row: {
          coach_user_id: string
          created_at: string
          dp_batting_order: number | null
          dp_player_name: string
          flex_player_name: string
          flex_position: string
          game_date: string
          game_label: string | null
          id: string
          is_dp_active: boolean | null
          notes: string | null
          substitutions: Json | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          coach_user_id: string
          created_at?: string
          dp_batting_order?: number | null
          dp_player_name: string
          flex_player_name: string
          flex_position?: string
          game_date?: string
          game_label?: string | null
          id?: string
          is_dp_active?: boolean | null
          notes?: string | null
          substitutions?: Json | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          coach_user_id?: string
          created_at?: string
          dp_batting_order?: number | null
          dp_player_name?: string
          flex_player_name?: string
          flex_position?: string
          game_date?: string
          game_label?: string | null
          id?: string
          is_dp_active?: boolean | null
          notes?: string | null
          substitutions?: Json | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dpflex_lineups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      drill_assignments: {
        Row: {
          assigned_at: string
          athlete_user_id: string
          coach_user_id: string
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          drill_id: string
          due_date: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          athlete_user_id: string
          coach_user_id: string
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          drill_id: string
          due_date?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          athlete_user_id?: string
          coach_user_id?: string
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          drill_id?: string
          due_date?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drill_assignments_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "drills"
            referencedColumns: ["id"]
          },
        ]
      }
      drills: {
        Row: {
          age_group: string[] | null
          approved_by: string | null
          coaching_points: string[] | null
          created_at: string
          created_by: string
          description: string | null
          difficulty: string
          id: string
          kpi_mapping: string[] | null
          position: string[] | null
          prerequisites: string[] | null
          published_at: string | null
          recommended_use_cases: string[] | null
          rejection_note: string | null
          revision_note: string | null
          skill_category: string
          softball_format: string | null
          sport_type: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          age_group?: string[] | null
          approved_by?: string | null
          coaching_points?: string[] | null
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: string
          id?: string
          kpi_mapping?: string[] | null
          position?: string[] | null
          prerequisites?: string[] | null
          published_at?: string | null
          recommended_use_cases?: string[] | null
          rejection_note?: string | null
          revision_note?: string | null
          skill_category: string
          softball_format?: string | null
          sport_type?: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          age_group?: string[] | null
          approved_by?: string | null
          coaching_points?: string[] | null
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string
          id?: string
          kpi_mapping?: string[] | null
          position?: string[] | null
          prerequisites?: string[] | null
          published_at?: string | null
          recommended_use_cases?: string[] | null
          rejection_note?: string | null
          revision_note?: string | null
          skill_category?: string
          softball_format?: string | null
          sport_type?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      evaluation_leads: {
        Row: {
          age: number | null
          ai_feedback: Json | null
          athlete_name: string
          created_at: string | null
          current_velocity: string | null
          development_score: number | null
          email: string
          id: string
          phone: string | null
          position: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          age?: number | null
          ai_feedback?: Json | null
          athlete_name: string
          created_at?: string | null
          current_velocity?: string | null
          development_score?: number | null
          email: string
          id?: string
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          age?: number | null
          ai_feedback?: Json | null
          athlete_name?: string
          created_at?: string | null
          current_velocity?: string | null
          development_score?: number | null
          email?: string
          id?: string
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      exam_questions: {
        Row: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          correct_answer: string
          created_at: string
          difficulty_level: string
          id: string
          kpi_category: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          question_id: string
          question_type: string
          scenario_id: string | null
          step_number: number | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          correct_answer: string
          created_at?: string
          difficulty_level?: string
          id?: string
          kpi_category?: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          question_id: string
          question_type?: string
          scenario_id?: string | null
          step_number?: number | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          cert_type?: Database["public"]["Enums"]["admin_cert_type"]
          correct_answer?: string
          created_at?: string
          difficulty_level?: string
          id?: string
          kpi_category?: string | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          question_id?: string
          question_type?: string
          scenario_id?: string | null
          step_number?: number | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      group_session_enrollments: {
        Row: {
          athlete_user_id: string
          credit_id: string | null
          enrolled_at: string
          id: string
          session_id: string
          status: string
        }
        Insert: {
          athlete_user_id: string
          credit_id?: string | null
          enrolled_at?: string
          id?: string
          session_id: string
          status?: string
        }
        Update: {
          athlete_user_id?: string
          credit_id?: string | null
          enrolled_at?: string
          id?: string
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_session_enrollments_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "lesson_credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_session_enrollments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "group_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_sessions: {
        Row: {
          coach_user_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          focus_area: string | null
          id: string
          max_participants: number
          price_credits: number
          scheduled_at: string
          skill_level: string | null
          status: string
          title: string
          updated_at: string
          video_call_link: string | null
        }
        Insert: {
          coach_user_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          focus_area?: string | null
          id?: string
          max_participants?: number
          price_credits?: number
          scheduled_at: string
          skill_level?: string | null
          status?: string
          title: string
          updated_at?: string
          video_call_link?: string | null
        }
        Update: {
          coach_user_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          focus_area?: string | null
          id?: string
          max_participants?: number
          price_credits?: number
          scheduled_at?: string
          skill_level?: string | null
          status?: string
          title?: string
          updated_at?: string
          video_call_link?: string | null
        }
        Relationships: []
      }
      highlight_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          privacy_level: string
          sport_type: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          privacy_level?: string
          sport_type?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          privacy_level?: string
          sport_type?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      injury_reports: {
        Row: {
          body_part: string
          cleared_by_medical: boolean | null
          created_at: string
          days_missed: number | null
          description: string | null
          id: string
          injury_date: string
          injury_type: string
          is_resolved: boolean | null
          resolved_date: string | null
          severity: number
          treatment: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body_part: string
          cleared_by_medical?: boolean | null
          created_at?: string
          days_missed?: number | null
          description?: string | null
          id?: string
          injury_date?: string
          injury_type?: string
          is_resolved?: boolean | null
          resolved_date?: string | null
          severity?: number
          treatment?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body_part?: string
          cleared_by_medical?: boolean | null
          created_at?: string
          days_missed?: number | null
          description?: string | null
          id?: string
          injury_date?: string
          injury_type?: string
          is_resolved?: boolean | null
          resolved_date?: string | null
          severity?: number
          treatment?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligence_outputs: {
        Row: {
          alerts: Json | null
          athlete_user_id: string
          gaps_summary: string[] | null
          generated_at: string
          id: string
          recommended_courses: string[] | null
          recommended_drills: string[] | null
          recommended_programs: string[] | null
          sport_type: string
          status: string | null
          strengths_summary: string[] | null
          top_priorities: string[] | null
          weekly_focus_plan: Json | null
        }
        Insert: {
          alerts?: Json | null
          athlete_user_id: string
          gaps_summary?: string[] | null
          generated_at?: string
          id?: string
          recommended_courses?: string[] | null
          recommended_drills?: string[] | null
          recommended_programs?: string[] | null
          sport_type?: string
          status?: string | null
          strengths_summary?: string[] | null
          top_priorities?: string[] | null
          weekly_focus_plan?: Json | null
        }
        Update: {
          alerts?: Json | null
          athlete_user_id?: string
          gaps_summary?: string[] | null
          generated_at?: string
          id?: string
          recommended_courses?: string[] | null
          recommended_drills?: string[] | null
          recommended_programs?: string[] | null
          sport_type?: string
          status?: string | null
          strengths_summary?: string[] | null
          top_priorities?: string[] | null
          weekly_focus_plan?: Json | null
        }
        Relationships: []
      }
      intelligence_rules: {
        Row: {
          action_data: Json | null
          action_target: string
          action_type: string
          actions: Json | null
          age_group_filter: string[] | null
          condition_field: string
          condition_operator: string
          condition_type: string
          condition_value: string
          condition_window_days: number | null
          conditions: Json | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          position_filter: string[] | null
          priority: number
          softball_format: string | null
          sport_type: string | null
          trigger_count: number
          trigger_history: Json | null
          updated_at: string
        }
        Insert: {
          action_data?: Json | null
          action_target: string
          action_type: string
          actions?: Json | null
          age_group_filter?: string[] | null
          condition_field: string
          condition_operator: string
          condition_type: string
          condition_value: string
          condition_window_days?: number | null
          conditions?: Json | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          position_filter?: string[] | null
          priority?: number
          softball_format?: string | null
          sport_type?: string | null
          trigger_count?: number
          trigger_history?: Json | null
          updated_at?: string
        }
        Update: {
          action_data?: Json | null
          action_target?: string
          action_type?: string
          actions?: Json | null
          age_group_filter?: string[] | null
          condition_field?: string
          condition_operator?: string
          condition_type?: string
          condition_value?: string
          condition_window_days?: number | null
          conditions?: Json | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          position_filter?: string[] | null
          priority?: number
          softball_format?: string | null
          sport_type?: string | null
          trigger_count?: number
          trigger_history?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          entry_date: string
          id: string
          is_private: boolean | null
          mood: number | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entry_date?: string
          id?: string
          is_private?: boolean | null
          mood?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          is_private?: boolean | null
          mood?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kpi_definitions: {
        Row: {
          age_group_adjustments: Json | null
          category: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          position_relevance: string[] | null
          scale: Json | null
          sport_type: string
          thresholds: Json | null
          unit: string
          updated_at: string
        }
        Insert: {
          age_group_adjustments?: Json | null
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          position_relevance?: string[] | null
          scale?: Json | null
          sport_type?: string
          thresholds?: Json | null
          unit: string
          updated_at?: string
        }
        Update: {
          age_group_adjustments?: Json | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          position_relevance?: string[] | null
          scale?: Json | null
          sport_type?: string
          thresholds?: Json | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      kpi_share_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          include_goals: boolean | null
          include_stats: boolean | null
          include_videos: boolean | null
          label: string | null
          token: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_goals?: boolean | null
          include_stats?: boolean | null
          include_videos?: boolean | null
          label?: string | null
          token: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_goals?: boolean | null
          include_stats?: boolean | null
          include_videos?: boolean | null
          label?: string | null
          token?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      lead_captures: {
        Row: {
          athlete_age: number | null
          athlete_name: string
          created_at: string
          email: string
          id: string
          lead_source: string | null
          parent_name: string | null
          primary_position: string | null
        }
        Insert: {
          athlete_age?: number | null
          athlete_name: string
          created_at?: string
          email: string
          id?: string
          lead_source?: string | null
          parent_name?: string | null
          primary_position?: string | null
        }
        Update: {
          athlete_age?: number | null
          athlete_name?: string
          created_at?: string
          email?: string
          id?: string
          lead_source?: string | null
          parent_name?: string | null
          primary_position?: string | null
        }
        Relationships: []
      }
      lesson_credit_usage: {
        Row: {
          credit_id: string
          id: string
          lesson_id: string | null
          lesson_type: string
          used_at: string
          user_id: string
        }
        Insert: {
          credit_id: string
          id?: string
          lesson_id?: string | null
          lesson_type?: string
          used_at?: string
          user_id: string
        }
        Update: {
          credit_id?: string
          id?: string
          lesson_id?: string | null
          lesson_type?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_credit_usage_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "lesson_credits"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_credits: {
        Row: {
          created_at: string
          credit_type: string
          expires_at: string | null
          granted_by: string | null
          granted_reason: string | null
          id: string
          last_used_at: string | null
          package_id: string | null
          purchased_at: string
          stripe_session_id: string | null
          total_lessons: number
          used_lessons: number
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_type?: string
          expires_at?: string | null
          granted_by?: string | null
          granted_reason?: string | null
          id?: string
          last_used_at?: string | null
          package_id?: string | null
          purchased_at?: string
          stripe_session_id?: string | null
          total_lessons: number
          used_lessons?: number
          user_id: string
        }
        Update: {
          created_at?: string
          credit_type?: string
          expires_at?: string | null
          granted_by?: string | null
          granted_reason?: string | null
          id?: string
          last_used_at?: string | null
          package_id?: string | null
          purchased_at?: string
          stripe_session_id?: string | null
          total_lessons?: number
          used_lessons?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_credits_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "lesson_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_outcomes: {
        Row: {
          athlete_user_id: string
          coach_notes: string | null
          coach_user_id: string
          courses_recommended: Json | null
          created_at: string
          drills_assigned: string[] | null
          feedback_id: string | null
          id: string
          injury_flags: string[] | null
          kpi_updates: Json | null
          lesson_id: string
          lesson_type: string | null
          parent_summary: string | null
          programs_assigned: Json | null
          session_number: number | null
          skill_category: string
          skills_worked: string[] | null
          sport_type: string
          strengths_noted: string[] | null
          weaknesses_noted: string[] | null
        }
        Insert: {
          athlete_user_id: string
          coach_notes?: string | null
          coach_user_id: string
          courses_recommended?: Json | null
          created_at?: string
          drills_assigned?: string[] | null
          feedback_id?: string | null
          id?: string
          injury_flags?: string[] | null
          kpi_updates?: Json | null
          lesson_id: string
          lesson_type?: string | null
          parent_summary?: string | null
          programs_assigned?: Json | null
          session_number?: number | null
          skill_category: string
          skills_worked?: string[] | null
          sport_type?: string
          strengths_noted?: string[] | null
          weaknesses_noted?: string[] | null
        }
        Update: {
          athlete_user_id?: string
          coach_notes?: string | null
          coach_user_id?: string
          courses_recommended?: Json | null
          created_at?: string
          drills_assigned?: string[] | null
          feedback_id?: string | null
          id?: string
          injury_flags?: string[] | null
          kpi_updates?: Json | null
          lesson_id?: string
          lesson_type?: string | null
          parent_summary?: string | null
          programs_assigned?: Json | null
          session_number?: number | null
          skill_category?: string
          skills_worked?: string[] | null
          sport_type?: string
          strengths_noted?: string[] | null
          weaknesses_noted?: string[] | null
        }
        Relationships: []
      }
      lesson_packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          lesson_count: number
          name: string
          package_type: string
          price_cents: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lesson_count: number
          name: string
          package_type?: string
          price_cents: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lesson_count?: number
          name?: string
          package_type?: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lesson_reminders: {
        Row: {
          channel: string
          created_at: string | null
          id: string
          lesson_id: string
          reminder_type: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          id?: string
          lesson_id: string
          reminder_type: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: string
          lesson_id?: string
          reminder_type?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      maintenance_reports: {
        Row: {
          created_at: string
          duration_seconds: number | null
          errors: Json | null
          id: string
          report_data: Json
          run_ended_at: string | null
          run_started_at: string
          status: string
          trigger_type: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          errors?: Json | null
          id?: string
          report_data?: Json
          run_ended_at?: string | null
          run_started_at: string
          status?: string
          trigger_type?: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          errors?: Json | null
          id?: string
          report_data?: Json
          run_ended_at?: string | null
          run_started_at?: string
          status?: string
          trigger_type?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      marketplace_bookings: {
        Row: {
          amount_cents: number
          athlete_notes: string | null
          athlete_user_id: string
          coach_id: string
          coach_notes: string | null
          coach_payout_cents: number
          created_at: string | null
          id: string
          notes: string | null
          platform_fee_cents: number
          recording_url: string | null
          scheduled_at: string | null
          service_id: string
          status: string | null
          updated_at: string | null
          video_call_link: string | null
        }
        Insert: {
          amount_cents: number
          athlete_notes?: string | null
          athlete_user_id: string
          coach_id: string
          coach_notes?: string | null
          coach_payout_cents: number
          created_at?: string | null
          id?: string
          notes?: string | null
          platform_fee_cents: number
          recording_url?: string | null
          scheduled_at?: string | null
          service_id: string
          status?: string | null
          updated_at?: string | null
          video_call_link?: string | null
        }
        Update: {
          amount_cents?: number
          athlete_notes?: string | null
          athlete_user_id?: string
          coach_id?: string
          coach_notes?: string | null
          coach_payout_cents?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          platform_fee_cents?: number
          recording_url?: string | null
          scheduled_at?: string | null
          service_id?: string
          status?: string | null
          updated_at?: string | null
          video_call_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "coach_services"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_earnings: {
        Row: {
          booking_id: string
          coach_amount_cents: number
          coach_id: string
          created_at: string | null
          id: string
          platform_fee_cents: number
          status: string | null
          total_amount_cents: number
        }
        Insert: {
          booking_id: string
          coach_amount_cents: number
          coach_id: string
          created_at?: string | null
          id?: string
          platform_fee_cents: number
          status?: string | null
          total_amount_cents: number
        }
        Update: {
          booking_id?: string
          coach_amount_cents?: number
          coach_id?: string
          created_at?: string | null
          id?: string
          platform_fee_cents?: number
          status?: string | null
          total_amount_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "marketplace_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_earnings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          goal_type: string
          id: string
          is_completed: boolean | null
          priority: number | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean | null
          priority?: number | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean | null
          priority?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mental_performance_logs: {
        Row: {
          anxiety_level: number | null
          confidence_level: number | null
          created_at: string
          focus_level: number | null
          id: string
          log_date: string
          motivation_level: number | null
          notes: string | null
          pre_game_routine_completed: boolean | null
          updated_at: string
          user_id: string
          visualization_minutes: number | null
        }
        Insert: {
          anxiety_level?: number | null
          confidence_level?: number | null
          created_at?: string
          focus_level?: number | null
          id?: string
          log_date?: string
          motivation_level?: number | null
          notes?: string | null
          pre_game_routine_completed?: boolean | null
          updated_at?: string
          user_id: string
          visualization_minutes?: number | null
        }
        Update: {
          anxiety_level?: number | null
          confidence_level?: number | null
          created_at?: string
          focus_level?: number | null
          id?: string
          log_date?: string
          motivation_level?: number | null
          notes?: string | null
          pre_game_routine_completed?: boolean | null
          updated_at?: string
          user_id?: string
          visualization_minutes?: number | null
        }
        Relationships: []
      }
      mental_performance_records: {
        Row: {
          athlete_user_id: string
          bounce_back_rate: number | null
          confidence_score: number | null
          created_at: string
          focus_consistency: number | null
          goal_completion_rate: number | null
          id: string
          journal_entry: string | null
          pressure_performance_index: number | null
          week_of: string
        }
        Insert: {
          athlete_user_id: string
          bounce_back_rate?: number | null
          confidence_score?: number | null
          created_at?: string
          focus_consistency?: number | null
          goal_completion_rate?: number | null
          id?: string
          journal_entry?: string | null
          pressure_performance_index?: number | null
          week_of: string
        }
        Update: {
          athlete_user_id?: string
          bounce_back_rate?: number | null
          confidence_score?: number | null
          created_at?: string
          focus_consistency?: number | null
          goal_completion_rate?: number | null
          id?: string
          journal_entry?: string | null
          pressure_performance_index?: number | null
          week_of?: string
        }
        Relationships: []
      }
      metric_share_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          include_hitting: boolean | null
          include_pitching: boolean | null
          include_throwing: boolean | null
          include_trends: boolean | null
          is_public: boolean | null
          label: string | null
          last_viewed_at: string | null
          recipient_email: string | null
          recipient_name: string | null
          token: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_hitting?: boolean | null
          include_pitching?: boolean | null
          include_throwing?: boolean | null
          include_trends?: boolean | null
          is_public?: boolean | null
          label?: string | null
          last_viewed_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          token: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_hitting?: boolean | null
          include_pitching?: boolean | null
          include_throwing?: boolean | null
          include_trends?: boolean | null
          is_public?: boolean | null
          label?: string | null
          last_viewed_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          token?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      mfa_backup_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          notification_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_analytics_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          analytics_consent: boolean
          analytics_consent_updated_at: string | null
          coach_messages: boolean
          community_comments: boolean
          community_likes: boolean
          community_mentions: boolean
          course_updates: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_consent?: boolean
          analytics_consent_updated_at?: string | null
          coach_messages?: boolean
          community_comments?: boolean
          community_likes?: boolean
          community_mentions?: boolean
          course_updates?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_consent?: boolean
          analytics_consent_updated_at?: string | null
          coach_messages?: boolean
          community_comments?: boolean
          community_likes?: boolean
          community_mentions?: boolean
          course_updates?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          post_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          post_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          post_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_archive: {
        Row: {
          actor_id: string | null
          archived_at: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          archived_at?: string
          created_at?: string | null
          id: string
          is_read?: boolean | null
          message?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          archived_at?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      parent_athlete_links: {
        Row: {
          athlete_user_id: string
          created_at: string
          id: string
          link_code: string | null
          linked_at: string | null
          parent_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          athlete_user_id: string
          created_at?: string
          id?: string
          link_code?: string | null
          linked_at?: string | null
          parent_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          athlete_user_id?: string
          created_at?: string
          id?: string
          link_code?: string | null
          linked_at?: string | null
          parent_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pitch_counts: {
        Row: {
          avg_velocity: number | null
          created_at: string
          id: string
          innings_pitched: number | null
          max_velocity: number | null
          notes: string | null
          pain_level: number | null
          pain_location: string | null
          pain_reported: boolean | null
          pitch_count: number
          pitch_types: Json | null
          session_date: string
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_velocity?: number | null
          created_at?: string
          id?: string
          innings_pitched?: number | null
          max_velocity?: number | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          pain_reported?: boolean | null
          pitch_count?: number
          pitch_types?: Json | null
          session_date?: string
          session_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_velocity?: number | null
          created_at?: string
          id?: string
          innings_pitched?: number | null
          max_velocity?: number | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          pain_reported?: boolean | null
          pitch_count?: number
          pitch_types?: Json | null
          session_date?: string
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pitch_type_counts: {
        Row: {
          athlete_user_id: string
          count: number
          created_at: string
          id: string
          pitch_type: string
          session_date: string
          session_id: string | null
          session_source: string
          sport_type: string
        }
        Insert: {
          athlete_user_id: string
          count?: number
          created_at?: string
          id?: string
          pitch_type: string
          session_date?: string
          session_id?: string | null
          session_source?: string
          sport_type?: string
        }
        Update: {
          athlete_user_id?: string
          count?: number
          created_at?: string
          id?: string
          pitch_type?: string
          session_date?: string
          session_id?: string | null
          session_source?: string
          sport_type?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      player_homework: {
        Row: {
          athlete_user_id: string
          category: string | null
          coach_user_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          feedback_id: string | null
          id: string
          is_completed: boolean | null
          lesson_id: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          athlete_user_id: string
          category?: string | null
          coach_user_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          feedback_id?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          athlete_user_id?: string
          category?: string | null
          coach_user_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          feedback_id?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_homework_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "coach_lesson_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_plans: {
        Row: {
          coach_user_id: string
          created_at: string
          duration_minutes: number | null
          focus_areas: string[] | null
          id: string
          notes: string | null
          plan_blocks: Json | null
          practice_date: string
          sport_type: string | null
          status: string | null
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          coach_user_id: string
          created_at?: string
          duration_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          notes?: string | null
          plan_blocks?: Json | null
          practice_date: string
          sport_type?: string | null
          status?: string | null
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          coach_user_id?: string
          created_at?: string
          duration_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          notes?: string | null
          plan_blocks?: Json | null
          practice_date?: string
          sport_type?: string | null
          status?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_plans_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_gpa: number | null
          age_group: string | null
          avatar_url: string | null
          batting_side: string | null
          bio: string | null
          bio_privacy: string
          contact_privacy: string
          cover_url: string | null
          created_at: string
          display_name: string | null
          division_target: string | null
          email: string | null
          goals: Json | null
          graduation_year: number | null
          height_inches: number | null
          hudl_url: string | null
          id: string
          instagram_url: string | null
          intended_major: string | null
          physical_stats_privacy: string
          position: string | null
          secondary_positions: string[] | null
          sixty_yard_dash: number | null
          softball_format: string | null
          sport_type: string
          target_schools: string[] | null
          throwing_arm: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          weight_lbs: number | null
          wingspan_inches: number | null
          youtube_url: string | null
        }
        Insert: {
          academic_gpa?: number | null
          age_group?: string | null
          avatar_url?: string | null
          batting_side?: string | null
          bio?: string | null
          bio_privacy?: string
          contact_privacy?: string
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          division_target?: string | null
          email?: string | null
          goals?: Json | null
          graduation_year?: number | null
          height_inches?: number | null
          hudl_url?: string | null
          id?: string
          instagram_url?: string | null
          intended_major?: string | null
          physical_stats_privacy?: string
          position?: string | null
          secondary_positions?: string[] | null
          sixty_yard_dash?: number | null
          softball_format?: string | null
          sport_type?: string
          target_schools?: string[] | null
          throwing_arm?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          weight_lbs?: number | null
          wingspan_inches?: number | null
          youtube_url?: string | null
        }
        Update: {
          academic_gpa?: number | null
          age_group?: string | null
          avatar_url?: string | null
          batting_side?: string | null
          bio?: string | null
          bio_privacy?: string
          contact_privacy?: string
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          division_target?: string | null
          email?: string | null
          goals?: Json | null
          graduation_year?: number | null
          height_inches?: number | null
          hudl_url?: string | null
          id?: string
          instagram_url?: string | null
          intended_major?: string | null
          physical_stats_privacy?: string
          position?: string | null
          secondary_positions?: string[] | null
          sixty_yard_dash?: number | null
          softball_format?: string | null
          sport_type?: string
          target_schools?: string[] | null
          throwing_arm?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          weight_lbs?: number | null
          wingspan_inches?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      program_assignments: {
        Row: {
          athlete_user_id: string
          coach_user_id: string
          completion_percent: number | null
          created_at: string
          current_week: number | null
          id: string
          program_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          athlete_user_id: string
          coach_user_id: string
          completion_percent?: number | null
          created_at?: string
          current_week?: number | null
          id?: string
          program_id: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          athlete_user_id?: string
          coach_user_id?: string
          completion_percent?: number | null
          created_at?: string
          current_week?: number | null
          id?: string
          program_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_assignments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          age_group: string[] | null
          approved_by: string | null
          created_at: string
          created_by: string
          description: string | null
          difficulty: string | null
          drill_sequence: Json | null
          duration_weeks: number | null
          id: string
          is_assignable: boolean | null
          kpi_targets: Json | null
          name: string
          published_at: string | null
          rejection_note: string | null
          revision_note: string | null
          skill_focus: string | null
          softball_format: string | null
          sport_type: string
          status: string
          updated_at: string
        }
        Insert: {
          age_group?: string[] | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: string | null
          drill_sequence?: Json | null
          duration_weeks?: number | null
          id?: string
          is_assignable?: boolean | null
          kpi_targets?: Json | null
          name: string
          published_at?: string | null
          rejection_note?: string | null
          revision_note?: string | null
          skill_focus?: string | null
          softball_format?: string | null
          sport_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          age_group?: string[] | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string | null
          drill_sequence?: Json | null
          duration_weeks?: number | null
          id?: string
          is_assignable?: boolean | null
          kpi_targets?: Json | null
          name?: string
          published_at?: string | null
          rejection_note?: string | null
          revision_note?: string | null
          skill_focus?: string | null
          softball_format?: string | null
          sport_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_results: {
        Row: {
          attempt_id: string
          correct_answer: string
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_answer: string
        }
        Insert: {
          attempt_id: string
          correct_answer: string
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_answer: string
        }
        Update: {
          attempt_id?: string
          correct_answer?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "admin_exam_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiting_checklist: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          item_key: string
          item_label: string
          notes: string | null
          user_id: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          item_key: string
          item_label: string
          notes?: string | null
          user_id: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          item_key?: string
          item_label?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recruiting_contacts: {
        Row: {
          coach_email: string | null
          coach_name: string | null
          coach_phone: string | null
          coach_title: string | null
          contact_status: string
          created_at: string
          division: string | null
          id: string
          interest_level: string | null
          last_contact_date: string | null
          next_follow_up: string | null
          notes: string | null
          school_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_email?: string | null
          coach_name?: string | null
          coach_phone?: string | null
          coach_title?: string | null
          contact_status?: string
          created_at?: string
          division?: string | null
          id?: string
          interest_level?: string | null
          last_contact_date?: string | null
          next_follow_up?: string | null
          notes?: string | null
          school_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_email?: string | null
          coach_name?: string | null
          coach_phone?: string | null
          coach_title?: string | null
          contact_status?: string
          created_at?: string
          division?: string | null
          id?: string
          interest_level?: string | null
          last_contact_date?: string | null
          next_follow_up?: string | null
          notes?: string | null
          school_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recruiting_exports: {
        Row: {
          athlete_user_id: string
          created_at: string
          export_type: string
          file_url: string | null
          generated_at: string
          id: string
        }
        Insert: {
          athlete_user_id: string
          created_at?: string
          export_type: string
          file_url?: string | null
          generated_at?: string
          id?: string
        }
        Update: {
          athlete_user_id?: string
          created_at?: string
          export_type?: string
          file_url?: string | null
          generated_at?: string
          id?: string
        }
        Relationships: []
      }
      recruiting_profiles: {
        Row: {
          academic_interests: string | null
          act_score: number | null
          coach_recommendation_id: string | null
          commitment_status: string
          committed_at: string | null
          committed_school: string | null
          created_at: string
          division_target: string[] | null
          eligibility_checklist: Json | null
          extracurriculars: string | null
          gpa: number | null
          highlight_clip_ids: string[] | null
          highlight_video_url: string | null
          id: string
          intended_major: string | null
          last_exported_at: string | null
          ncaa_eligibility_center: boolean | null
          ncaa_id: string | null
          recruiting_notes: string | null
          references_contacts: Json | null
          sat_score: number | null
          school_interest_list: Json | null
          shareable_link: string | null
          showcase_history: Json | null
          skills_video_url: string | null
          sport_type: string
          updated_at: string
          user_id: string
          verified_stats: Json | null
          visibility: string
        }
        Insert: {
          academic_interests?: string | null
          act_score?: number | null
          coach_recommendation_id?: string | null
          commitment_status?: string
          committed_at?: string | null
          committed_school?: string | null
          created_at?: string
          division_target?: string[] | null
          eligibility_checklist?: Json | null
          extracurriculars?: string | null
          gpa?: number | null
          highlight_clip_ids?: string[] | null
          highlight_video_url?: string | null
          id?: string
          intended_major?: string | null
          last_exported_at?: string | null
          ncaa_eligibility_center?: boolean | null
          ncaa_id?: string | null
          recruiting_notes?: string | null
          references_contacts?: Json | null
          sat_score?: number | null
          school_interest_list?: Json | null
          shareable_link?: string | null
          showcase_history?: Json | null
          skills_video_url?: string | null
          sport_type?: string
          updated_at?: string
          user_id: string
          verified_stats?: Json | null
          visibility?: string
        }
        Update: {
          academic_interests?: string | null
          act_score?: number | null
          coach_recommendation_id?: string | null
          commitment_status?: string
          committed_at?: string | null
          committed_school?: string | null
          created_at?: string
          division_target?: string[] | null
          eligibility_checklist?: Json | null
          extracurriculars?: string | null
          gpa?: number | null
          highlight_clip_ids?: string[] | null
          highlight_video_url?: string | null
          id?: string
          intended_major?: string | null
          last_exported_at?: string | null
          ncaa_eligibility_center?: boolean | null
          ncaa_id?: string | null
          recruiting_notes?: string | null
          references_contacts?: Json | null
          sat_score?: number | null
          school_interest_list?: Json | null
          shareable_link?: string | null
          showcase_history?: Json | null
          skills_video_url?: string | null
          sport_type?: string
          updated_at?: string
          user_id?: string
          verified_stats?: Json | null
          visibility?: string
        }
        Relationships: []
      }
      remote_lessons: {
        Row: {
          ai_homework: string | null
          ai_recap: string | null
          athlete_feedback: string | null
          athlete_rating: number | null
          athlete_user_id: string
          coach_notes: string | null
          coach_user_id: string
          created_at: string
          credit_id: string | null
          duration_minutes: number
          format: string | null
          id: string
          notes: string | null
          recap_generated_at: string | null
          scheduled_at: string
          sport_type: string
          status: string
          updated_at: string
          video_call_link: string | null
        }
        Insert: {
          ai_homework?: string | null
          ai_recap?: string | null
          athlete_feedback?: string | null
          athlete_rating?: number | null
          athlete_user_id: string
          coach_notes?: string | null
          coach_user_id: string
          created_at?: string
          credit_id?: string | null
          duration_minutes?: number
          format?: string | null
          id?: string
          notes?: string | null
          recap_generated_at?: string | null
          scheduled_at: string
          sport_type?: string
          status?: string
          updated_at?: string
          video_call_link?: string | null
        }
        Update: {
          ai_homework?: string | null
          ai_recap?: string | null
          athlete_feedback?: string | null
          athlete_rating?: number | null
          athlete_user_id?: string
          coach_notes?: string | null
          coach_user_id?: string
          created_at?: string
          credit_id?: string | null
          duration_minutes?: number
          format?: string | null
          id?: string
          notes?: string | null
          recap_generated_at?: string | null
          scheduled_at?: string
          sport_type?: string
          status?: string
          updated_at?: string
          video_call_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remote_lessons_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "lesson_credits"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_programs: {
        Row: {
          age_group: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          duration_weeks: number | null
          exercises: Json | null
          id: string
          is_active: boolean | null
          program_type: string
          sessions_per_week: number | null
          sport_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration_weeks?: number | null
          exercises?: Json | null
          id?: string
          is_active?: boolean | null
          program_type?: string
          sessions_per_week?: number | null
          sport_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration_weeks?: number | null
          exercises?: Json | null
          id?: string
          is_active?: boolean | null
          program_type?: string
          sessions_per_week?: number | null
          sport_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sc_workout_logs: {
        Row: {
          created_at: string
          duration_minutes: number | null
          exercises_completed: Json | null
          id: string
          notes: string | null
          program_id: string | null
          rpe: number | null
          user_id: string
          workout_date: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          notes?: string | null
          program_id?: string | null
          rpe?: number | null
          user_id: string
          workout_date?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          notes?: string | null
          program_id?: string | null
          rpe?: number | null
          user_id?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_workout_logs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "sc_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_assignments: {
        Row: {
          assigned_by: string
          athlete_user_id: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          schedule_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_by: string
          athlete_user_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          schedule_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          athlete_user_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          schedule_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "custom_training_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_broadcasts: {
        Row: {
          created_at: string
          created_by: string
          id: string
          last_viewed_at: string | null
          last_viewed_by: string | null
          message: string
          notified_count: number | null
          scheduled_at: string
          sent_at: string | null
          status: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          last_viewed_at?: string | null
          last_viewed_by?: string | null
          message: string
          notified_count?: number | null
          scheduled_at: string
          sent_at?: string | null
          status?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          last_viewed_at?: string | null
          last_viewed_by?: string | null
          message?: string
          notified_count?: number | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      session_bookings: {
        Row: {
          athlete_age: number | null
          athlete_name: string
          coach_name: string | null
          coach_notified_at: string | null
          coach_user_id: string
          confirmation_sent_at: string | null
          created_at: string
          duration_minutes: number | null
          email: string
          format: string | null
          id: string
          location: string | null
          meeting_link: string | null
          notes: string | null
          parent_name: string | null
          phone: string | null
          primary_position: string | null
          session_date: string
          session_time: string
          session_type: string
          sport_type: string
          status: string
          updated_at: string
        }
        Insert: {
          athlete_age?: number | null
          athlete_name: string
          coach_name?: string | null
          coach_notified_at?: string | null
          coach_user_id: string
          confirmation_sent_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          email: string
          format?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          parent_name?: string | null
          phone?: string | null
          primary_position?: string | null
          session_date: string
          session_time: string
          session_type?: string
          sport_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          athlete_age?: number | null
          athlete_name?: string
          coach_name?: string | null
          coach_notified_at?: string | null
          coach_user_id?: string
          confirmation_sent_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          email?: string
          format?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          parent_name?: string | null
          phone?: string | null
          primary_position?: string | null
          session_date?: string
          session_time?: string
          session_type?: string
          sport_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_recordings: {
        Row: {
          athlete_user_id: string
          coach_user_id: string
          created_at: string | null
          duration_seconds: number | null
          id: string
          notes: string | null
          recording_url: string
          session_id: string | null
        }
        Insert: {
          athlete_user_id: string
          coach_user_id: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          recording_url: string
          session_id?: string | null
        }
        Update: {
          athlete_user_id?: string
          coach_user_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          recording_url?: string
          session_id?: string | null
        }
        Relationships: []
      }
      showcase_events: {
        Row: {
          cost_cents: number | null
          created_at: string
          event_date: string | null
          event_end_date: string | null
          event_name: string
          event_type: string
          id: string
          location: string | null
          notes: string | null
          organization: string | null
          results: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string
          event_date?: string | null
          event_end_date?: string | null
          event_name: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          organization?: string | null
          results?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_cents?: number | null
          created_at?: string
          event_date?: string | null
          event_end_date?: string | null
          event_name?: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          organization?: string | null
          results?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_progression: {
        Row: {
          athlete_user_id: string
          created_at: string
          current_score: number | null
          id: string
          last_session_at: string | null
          previous_score: number | null
          sessions_count: number | null
          skill_category: string
          skill_name: string
          sport_type: string
          trend: string | null
          updated_at: string
        }
        Insert: {
          athlete_user_id: string
          created_at?: string
          current_score?: number | null
          id?: string
          last_session_at?: string | null
          previous_score?: number | null
          sessions_count?: number | null
          skill_category: string
          skill_name: string
          sport_type?: string
          trend?: string | null
          updated_at?: string
        }
        Update: {
          athlete_user_id?: string
          created_at?: string
          current_score?: number | null
          id?: string
          last_session_at?: string | null
          previous_score?: number | null
          sessions_count?: number | null
          skill_category?: string
          skill_name?: string
          sport_type?: string
          trend?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      softball_pitch_types: {
        Row: {
          category: string
          id: string
          movement_direction: string | null
          name: string
          spin_type: string | null
          velocity_benchmarks: Json | null
        }
        Insert: {
          category: string
          id?: string
          movement_direction?: string | null
          name: string
          spin_type?: string | null
          velocity_benchmarks?: Json | null
        }
        Update: {
          category?: string
          id?: string
          movement_direction?: string | null
          name?: string
          spin_type?: string | null
          velocity_benchmarks?: Json | null
        }
        Relationships: []
      }
      softball_pitching_sessions: {
        Row: {
          athlete_user_id: string
          coach_user_id: string | null
          created_at: string
          id: string
          injury_risk_level: string | null
          mechanics_flags: string[] | null
          notes: string | null
          phase_scores: Json | null
          pitches_thrown: Json | null
          session_date: string
          total_pitch_count: number | null
          weekly_running_total: number | null
        }
        Insert: {
          athlete_user_id: string
          coach_user_id?: string | null
          created_at?: string
          id?: string
          injury_risk_level?: string | null
          mechanics_flags?: string[] | null
          notes?: string | null
          phase_scores?: Json | null
          pitches_thrown?: Json | null
          session_date?: string
          total_pitch_count?: number | null
          weekly_running_total?: number | null
        }
        Update: {
          athlete_user_id?: string
          coach_user_id?: string | null
          created_at?: string
          id?: string
          injury_risk_level?: string | null
          mechanics_flags?: string[] | null
          notes?: string | null
          phase_scores?: Json | null
          pitches_thrown?: Json | null
          session_date?: string
          total_pitch_count?: number | null
          weekly_running_total?: number | null
        }
        Relationships: []
      }
      softball_positions: {
        Row: {
          abbreviation: string
          fastpitch_relevant: boolean | null
          id: string
          name: string
          slowpitch_relevant: boolean | null
          sport_type: string
        }
        Insert: {
          abbreviation: string
          fastpitch_relevant?: boolean | null
          id?: string
          name: string
          slowpitch_relevant?: boolean | null
          sport_type?: string
        }
        Update: {
          abbreviation?: string
          fastpitch_relevant?: boolean | null
          id?: string
          name?: string
          slowpitch_relevant?: boolean | null
          sport_type?: string
        }
        Relationships: []
      }
      softball_slap_sessions: {
        Row: {
          athlete_user_id: string
          attempts_total: number | null
          coach_user_id: string | null
          created_at: string
          drills_assigned: string[] | null
          errors_observed: string[] | null
          footwork_score: number | null
          id: string
          notes: string | null
          placement_accuracy: number | null
          session_date: string
          slap_type: string
          success_rate: number | null
          timing_score: number | null
        }
        Insert: {
          athlete_user_id: string
          attempts_total?: number | null
          coach_user_id?: string | null
          created_at?: string
          drills_assigned?: string[] | null
          errors_observed?: string[] | null
          footwork_score?: number | null
          id?: string
          notes?: string | null
          placement_accuracy?: number | null
          session_date?: string
          slap_type: string
          success_rate?: number | null
          timing_score?: number | null
        }
        Update: {
          athlete_user_id?: string
          attempts_total?: number | null
          coach_user_id?: string | null
          created_at?: string
          drills_assigned?: string[] | null
          errors_observed?: string[] | null
          footwork_score?: number | null
          id?: string
          notes?: string | null
          placement_accuracy?: number | null
          session_date?: string
          slap_type?: string
          success_rate?: number | null
          timing_score?: number | null
        }
        Relationships: []
      }
      team_announcements: {
        Row: {
          author_user_id: string
          content: string
          created_at: string
          id: string
          pinned: boolean | null
          priority: string | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_user_id: string
          content: string
          created_at?: string
          id?: string
          pinned?: boolean | null
          priority?: string | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean | null
          priority?: string | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_announcements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_events: {
        Row: {
          created_at: string
          created_by: string
          end_time: string | null
          event_date: string
          event_type: string
          id: string
          is_cancelled: boolean | null
          location: string | null
          notes: string | null
          opponent: string | null
          start_time: string | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_time?: string | null
          event_date: string
          event_type?: string
          id?: string
          is_cancelled?: boolean | null
          location?: string | null
          notes?: string | null
          opponent?: string | null
          start_time?: string | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_time?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_cancelled?: boolean | null
          location?: string | null
          notes?: string | null
          opponent?: string | null
          start_time?: string | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          jersey_number: string | null
          joined_at: string | null
          position: string | null
          role: string
          status: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jersey_number?: string | null
          joined_at?: string | null
          position?: string | null
          role?: string
          status?: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jersey_number?: string | null
          joined_at?: string | null
          position?: string | null
          role?: string
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_whitelist: {
        Row: {
          added_by: string | null
          admin_access: boolean | null
          created_at: string | null
          email: string
          full_access: boolean | null
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          admin_access?: boolean | null
          created_at?: string | null
          email: string
          full_access?: boolean | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          admin_access?: boolean | null
          created_at?: string | null
          email?: string
          full_access?: boolean | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          age_group: string | null
          created_at: string
          description: string | null
          head_coach_user_id: string
          id: string
          invite_code: string | null
          is_active: boolean | null
          logo_url: string | null
          max_roster_size: number | null
          name: string
          season: string | null
          sport_type: string
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          description?: string | null
          head_coach_user_id: string
          id?: string
          invite_code?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          max_roster_size?: number | null
          name: string
          season?: string | null
          sport_type?: string
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          created_at?: string
          description?: string | null
          head_coach_user_id?: string
          id?: string
          invite_code?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          max_roster_size?: number | null
          name?: string
          season?: string | null
          sport_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_events: {
        Row: {
          athlete_user_id: string
          created_at: string
          end_date: string
          id: string
          is_active: boolean | null
          notes: string | null
          sport_type: string
          start_date: string
          total_games_played: number | null
          total_pitches_thrown: number | null
          tournament_name: string
          updated_at: string
        }
        Insert: {
          athlete_user_id: string
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          sport_type?: string
          start_date: string
          total_games_played?: number | null
          total_pitches_thrown?: number | null
          tournament_name: string
          updated_at?: string
        }
        Update: {
          athlete_user_id?: string
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          sport_type?: string
          start_date?: string
          total_games_played?: number | null
          total_pitches_thrown?: number | null
          tournament_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_games: {
        Row: {
          athlete_user_id: string
          created_at: string
          game_date: string
          game_number: number
          game_time: string | null
          id: string
          innings_pitched: number | null
          max_velocity: number | null
          notes: string | null
          pain_level: number | null
          pain_location: string | null
          pain_reported: boolean | null
          pitch_types: Json | null
          pitches_thrown: number | null
          rest_hours_since_last: number | null
          safe_to_pitch: boolean | null
          safe_to_pitch_reason: string | null
          tournament_id: string
        }
        Insert: {
          athlete_user_id: string
          created_at?: string
          game_date: string
          game_number?: number
          game_time?: string | null
          id?: string
          innings_pitched?: number | null
          max_velocity?: number | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          pain_reported?: boolean | null
          pitch_types?: Json | null
          pitches_thrown?: number | null
          rest_hours_since_last?: number | null
          safe_to_pitch?: boolean | null
          safe_to_pitch_reason?: string | null
          tournament_id: string
        }
        Update: {
          athlete_user_id?: string
          created_at?: string
          game_date?: string
          game_number?: number
          game_time?: string | null
          id?: string
          innings_pitched?: number | null
          max_velocity?: number | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          pain_reported?: boolean | null
          pitch_types?: Json | null
          pitches_thrown?: number | null
          rest_hours_since_last?: number | null
          safe_to_pitch?: boolean | null
          safe_to_pitch_reason?: string | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_games_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournament_events"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_feedback: {
        Row: {
          created_at: string
          favorite_feature: string | null
          feedback: string | null
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite_feature?: string | null
          feedback?: string | null
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          favorite_feature?: string | null
          feedback?: string | null
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      upsell_offers: {
        Row: {
          converted_at: string | null
          created_at: string
          cta_label: string
          cta_route: string
          description: string
          dismissed_at: string | null
          expires_at: string | null
          id: string
          is_converted: boolean
          is_dismissed: boolean
          offer_key: string
          offer_type: string
          priority: number
          title: string
          trigger_reason: string
          user_id: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          cta_label?: string
          cta_route: string
          description: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_converted?: boolean
          is_dismissed?: boolean
          offer_key: string
          offer_type: string
          priority?: number
          title: string
          trigger_reason: string
          user_id: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          cta_label?: string
          cta_route?: string
          description?: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_converted?: boolean
          is_dismissed?: boolean
          offer_key?: string
          offer_type?: string
          priority?: number
          title?: string
          trigger_reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_certifications: {
        Row: {
          attempt_id: string | null
          certificate_number: string | null
          certification_type: Database["public"]["Enums"]["certification_type"]
          created_at: string
          expiration_reminder_sent: boolean | null
          expiration_reminder_sent_at: string | null
          expires_at: string
          final_warning_sent: boolean | null
          final_warning_sent_at: string | null
          id: string
          issued_at: string
          score: number
          status: Database["public"]["Enums"]["certification_status"]
          stripe_payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_id?: string | null
          certificate_number?: string | null
          certification_type: Database["public"]["Enums"]["certification_type"]
          created_at?: string
          expiration_reminder_sent?: boolean | null
          expiration_reminder_sent_at?: string | null
          expires_at: string
          final_warning_sent?: boolean | null
          final_warning_sent_at?: string | null
          id?: string
          issued_at?: string
          score: number
          status?: Database["public"]["Enums"]["certification_status"]
          stripe_payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_id?: string | null
          certificate_number?: string | null
          certification_type?: Database["public"]["Enums"]["certification_type"]
          created_at?: string
          expiration_reminder_sent?: boolean | null
          expiration_reminder_sent_at?: string | null
          expires_at?: string
          final_warning_sent?: boolean | null
          final_warning_sent_at?: string | null
          id?: string
          issued_at?: string
          score?: number
          status?: Database["public"]["Enums"]["certification_status"]
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          expires_at: string | null
          id: string
          product_key: string
          purchased_at: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          expires_at?: string | null
          id?: string
          product_key: string
          purchased_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          product_key?: string
          purchased_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_info: string | null
          id: string
          is_current: boolean | null
          last_active_at: string
          os: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_info?: string | null
          id?: string
          is_current?: boolean | null
          last_active_at?: string
          os?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_info?: string | null
          id?: string
          is_current?: boolean | null
          last_active_at?: string
          os?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_trials: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          started_at: string
          status: string
          trial_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          started_at?: string
          status?: string
          trial_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          started_at?: string
          status?: string
          trial_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_analyses: {
        Row: {
          age_group: string | null
          ai_analysis: Json | null
          annotation_data: Json | null
          coach_notes: string | null
          coach_user_id: string | null
          created_at: string
          id: string
          phase_timestamps: Json | null
          pitch_type: string | null
          skill_category: string | null
          sport_type: string
          status: string
          updated_at: string
          user_id: string
          video_type: string
          video_url: string
        }
        Insert: {
          age_group?: string | null
          ai_analysis?: Json | null
          annotation_data?: Json | null
          coach_notes?: string | null
          coach_user_id?: string | null
          created_at?: string
          id?: string
          phase_timestamps?: Json | null
          pitch_type?: string | null
          skill_category?: string | null
          sport_type?: string
          status?: string
          updated_at?: string
          user_id: string
          video_type?: string
          video_url: string
        }
        Update: {
          age_group?: string | null
          ai_analysis?: Json | null
          annotation_data?: Json | null
          coach_notes?: string | null
          coach_user_id?: string | null
          created_at?: string
          id?: string
          phase_timestamps?: Json | null
          pitch_type?: string | null
          skill_category?: string | null
          sport_type?: string
          status?: string
          updated_at?: string
          user_id?: string
          video_type?: string
          video_url?: string
        }
        Relationships: []
      }
      video_exam_attempts: {
        Row: {
          answers: Json
          certification_type: string
          completed_at: string | null
          created_at: string | null
          id: string
          passed: boolean | null
          score: number | null
          total_points: number | null
          user_id: string
        }
        Insert: {
          answers?: Json
          certification_type: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          total_points?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          certification_type?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          total_points?: number | null
          user_id?: string
        }
        Relationships: []
      }
      video_questions: {
        Row: {
          certification_type: string
          correct_answers: Json
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          options_1: Json
          options_2: Json
          options_3: Json
          options_4: Json
          question_1: string
          question_2: string
          question_3: string
          question_4: string
          scenario_description: string | null
          updated_at: string | null
          video_url: string
        }
        Insert: {
          certification_type: string
          correct_answers?: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          options_1?: Json
          options_2?: Json
          options_3?: Json
          options_4?: Json
          question_1: string
          question_2: string
          question_3: string
          question_4: string
          scenario_description?: string | null
          updated_at?: string | null
          video_url: string
        }
        Update: {
          certification_type?: string
          correct_answers?: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          options_1?: Json
          options_2?: Json
          options_3?: Json
          options_4?: Json
          question_1?: string
          question_2?: string
          question_3?: string
          question_4?: string
          scenario_description?: string | null
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      weekly_tips: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          display_order: number
          expires_at: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      workload_records: {
        Row: {
          athlete_user_id: string
          created_at: string
          drill_sets_completed: number | null
          id: string
          lesson_minutes: number | null
          overuse_alert: string | null
          overuse_flag: boolean | null
          pitch_count: number | null
          readiness_score: number | null
          record_date: string
          recovery_status: string | null
          sleep_hours: number | null
          soreness_level: number | null
          sport_type: string
          throwing_count: number | null
          training_minutes: number | null
          updated_at: string
        }
        Insert: {
          athlete_user_id: string
          created_at?: string
          drill_sets_completed?: number | null
          id?: string
          lesson_minutes?: number | null
          overuse_alert?: string | null
          overuse_flag?: boolean | null
          pitch_count?: number | null
          readiness_score?: number | null
          record_date?: string
          recovery_status?: string | null
          sleep_hours?: number | null
          soreness_level?: number | null
          sport_type?: string
          throwing_count?: number | null
          training_minutes?: number | null
          updated_at?: string
        }
        Update: {
          athlete_user_id?: string
          created_at?: string
          drill_sets_completed?: number | null
          id?: string
          lesson_minutes?: number | null
          overuse_alert?: string | null
          overuse_flag?: boolean | null
          pitch_count?: number | null
          readiness_score?: number | null
          record_date?: string
          recovery_status?: string | null
          sleep_hours?: number | null
          soreness_level?: number | null
          sport_type?: string
          throwing_count?: number | null
          training_minutes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      workload_rules: {
        Row: {
          age_max: number
          age_min: number
          created_at: string
          high_pitch_threshold: number
          id: string
          max_innings_per_week: number
          max_pitches_per_game: number
          max_pitches_per_week: number
          notes: string | null
          required_rest_days_after_high: number
          sport_type: string
        }
        Insert: {
          age_max: number
          age_min: number
          created_at?: string
          high_pitch_threshold: number
          id?: string
          max_innings_per_week: number
          max_pitches_per_game: number
          max_pitches_per_week: number
          notes?: string | null
          required_rest_days_after_high?: number
          sport_type?: string
        }
        Update: {
          age_max?: number
          age_min?: number
          created_at?: string
          high_pitch_threshold?: number
          id?: string
          max_innings_per_week?: number
          max_pitches_per_game?: number
          max_pitches_per_week?: number
          notes?: string | null
          required_rest_days_after_high?: number
          sport_type?: string
        }
        Relationships: []
      }
      workload_thresholds: {
        Row: {
          age_group: string
          created_at: string
          id: string
          max_pitches_per_day: number | null
          max_pitches_per_week: number | null
          max_training_minutes_per_week: number | null
          owner_configurable: boolean | null
          position: string | null
          required_rest_days_after: Json | null
          sport_type: string
          updated_at: string
        }
        Insert: {
          age_group: string
          created_at?: string
          id?: string
          max_pitches_per_day?: number | null
          max_pitches_per_week?: number | null
          max_training_minutes_per_week?: number | null
          owner_configurable?: boolean | null
          position?: string | null
          required_rest_days_after?: Json | null
          sport_type?: string
          updated_at?: string
        }
        Update: {
          age_group?: string
          created_at?: string
          id?: string
          max_pitches_per_day?: number | null
          max_pitches_per_week?: number | null
          max_training_minutes_per_week?: number | null
          owner_configurable?: boolean | null
          position?: string | null
          required_rest_days_after?: Json | null
          sport_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      device_integrations_safe: {
        Row: {
          created_at: string | null
          device_type: Database["public"]["Enums"]["device_type"] | null
          id: string | null
          is_connected: boolean | null
          last_sync_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          id?: string | null
          is_connected?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          id?: string | null
          is_connected?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          batting_side: string | null
          bio: string | null
          bio_privacy: string | null
          contact_privacy: string | null
          cover_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          graduation_year: number | null
          height_inches: number | null
          hudl_url: string | null
          instagram_url: string | null
          physical_stats_privacy: string | null
          position: string | null
          sixty_yard_dash: number | null
          target_schools: string[] | null
          throwing_arm: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
          weight_lbs: number | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          batting_side?: string | null
          bio?: never
          bio_privacy?: string | null
          contact_privacy?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: never
          graduation_year?: number | null
          height_inches?: never
          hudl_url?: never
          instagram_url?: never
          physical_stats_privacy?: string | null
          position?: string | null
          sixty_yard_dash?: never
          target_schools?: string[] | null
          throwing_arm?: string | null
          twitter_url?: never
          updated_at?: string | null
          user_id?: string | null
          weight_lbs?: never
          youtube_url?: never
        }
        Update: {
          avatar_url?: string | null
          batting_side?: string | null
          bio?: never
          bio_privacy?: string | null
          contact_privacy?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: never
          graduation_year?: number | null
          height_inches?: never
          hudl_url?: never
          instagram_url?: never
          physical_stats_privacy?: string | null
          position?: string | null
          sixty_yard_dash?: never
          target_schools?: string[] | null
          throwing_arm?: string | null
          twitter_url?: never
          updated_at?: string | null
          user_id?: string | null
          weight_lbs?: never
          youtube_url?: never
        }
        Relationships: []
      }
      user_sessions_safe: {
        Row: {
          browser: string | null
          created_at: string | null
          device_info: string | null
          id: string | null
          ip_address_masked: string | null
          is_current: boolean | null
          last_active_at: string | null
          location: string | null
          os: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_info?: string | null
          id?: string | null
          ip_address_masked?: never
          is_current?: boolean | null
          last_active_at?: string | null
          location?: never
          os?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_info?: string | null
          id?: string | null
          ip_address_masked?: never
          is_current?: boolean | null
          last_active_at?: string | null
          location?: never
          os?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonymize_old_audit_ips:
        | { Args: never; Returns: number }
        | { Args: { days_threshold?: number }; Returns: number }
      calculate_athlete_development_score: {
        Args: { p_user_id: string }
        Returns: Json
      }
      can_create_activity: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_view_profile: {
        Args: { _profile_user_id: string; _viewer_id: string }
        Returns: boolean
      }
      check_exam_answer:
        | {
            Args: {
              p_attempt_id: string
              p_question_id: string
              p_selected_answer: number
            }
            Returns: {
              explanation: string
              is_correct: boolean
            }[]
          }
        | {
            Args: { question_id: string; selected_answer: number }
            Returns: boolean
          }
      decrypt_credential: { Args: { ciphertext: string }; Returns: string }
      detect_concurrent_sessions: {
        Args: { p_user_id: string }
        Returns: number
      }
      encrypt_credential: { Args: { plaintext: string }; Returns: string }
      generate_certificate_number: { Args: never; Returns: string }
      get_assigned_athlete_profiles: {
        Args: { coach_id: string }
        Returns: {
          avatar_url: string
          batting_side: string
          bio: string
          cover_url: string
          created_at: string
          display_name: string
          graduation_year: number
          height_inches: number
          hudl_url: string
          instagram_url: string
          player_position: string
          sixty_yard_dash: number
          target_schools: string[]
          throwing_arm: string
          twitter_url: string
          updated_at: string
          user_id: string
          weight_lbs: number
          youtube_url: string
        }[]
      }
      get_athlete_profile_for_coach: {
        Args: { athlete_id: string; coach_id: string }
        Returns: {
          avatar_url: string
          batting_side: string
          bio: string
          cover_url: string
          created_at: string
          display_name: string
          graduation_year: number
          height_inches: number
          hudl_url: string
          instagram_url: string
          player_position: string
          sixty_yard_dash: number
          target_schools: string[]
          throwing_arm: string
          twitter_url: string
          updated_at: string
          user_id: string
          weight_lbs: number
          youtube_url: string
        }[]
      }
      get_athlete_trial_status: { Args: { p_user_id: string }; Returns: Json }
      get_certificate_leaderboard: {
        Args: { result_limit?: number; time_filter?: string }
        Returns: {
          avatar_url: string
          certificate_count: number
          courses_completed: string[]
          display_name: string
          latest_certificate_date: string
          user_id: string
        }[]
      }
      get_coach_badge_level: { Args: { _user_id: string }; Returns: Json }
      get_coach_user_id_by_name: {
        Args: { _coach_name: string }
        Returns: string
      }
      get_device_credentials_secure: {
        Args: { p_device_type: string; p_user_id: string }
        Returns: {
          access_token: string
          api_key: string
          api_secret: string
          refresh_token: string
          token_expires_at: string
        }[]
      }
      get_exam_questions: {
        Args: {
          p_certification_type: Database["public"]["Enums"]["certification_type"]
          p_limit?: number
        }
        Returns: {
          id: string
          is_scenario: boolean
          options: Json
          question_text: string
          section: string
        }[]
      }
      get_parent_athlete_data: {
        Args: { p_athlete_id: string; p_parent_id: string }
        Returns: Json
      }
      get_profile_safe: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          batting_side: string
          bio: string
          bio_privacy: string
          contact_privacy: string
          cover_url: string
          created_at: string
          display_name: string
          email: string
          graduation_year: number
          height_inches: number
          hudl_url: string
          id: string
          instagram_url: string
          physical_stats_privacy: string
          position: string
          sixty_yard_dash: number
          target_schools: string[]
          throwing_arm: string
          twitter_url: string
          updated_at: string
          user_id: string
          weight_lbs: number
          youtube_url: string
        }[]
      }
      get_profile_with_privacy: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_public_profile: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          graduation_year: number
          player_position: string
          user_id: string
        }[]
      }
      get_public_profiles_by_ids: {
        Args: { user_ids: string[] }
        Returns: {
          avatar_url: string
          display_name: string
          graduation_year: number
          player_position: string
          user_id: string
        }[]
      }
      get_question_explanation: {
        Args: { question_id: string }
        Returns: {
          correct_answer_index: number
          explanation: string
          is_correct: boolean
        }[]
      }
      get_shared_kpi_profile: { Args: { share_token: string }; Returns: Json }
      get_shared_metrics: { Args: { share_token: string }; Returns: Json }
      get_user_purchase_for_admin: {
        Args: { purchase_id: string }
        Returns: {
          amount_cents: number
          created_at: string
          expires_at: string
          id: string
          product_key: string
          purchased_at: string
          status: string
          stripe_payment_intent_id: string
          stripe_session_id: string
          updated_at: string
          user_id: string
        }[]
      }
      has_admin_role: { Args: { user_uuid: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_team_access: { Args: { _user_id: string }; Returns: boolean }
      has_team_admin_access: { Args: { _user_id: string }; Returns: boolean }
      has_valid_certification: {
        Args: {
          _cert_type: Database["public"]["Enums"]["certification_type"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_22m_invite_usage: {
        Args: { token_id: string }
        Returns: undefined
      }
      increment_invite_usage: { Args: { token_id: string }; Returns: undefined }
      is_active_coach_for_athlete: {
        Args: { _athlete_id: string; _coach_id: string }
        Returns: boolean
      }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      list_all_purchases_for_admin: {
        Args: never
        Returns: {
          amount_cents: number
          created_at: string
          expires_at: string
          id: string
          product_key: string
          purchased_at: string
          status: string
          user_id: string
        }[]
      }
      obfuscate_ip: { Args: { ip_address: string }; Returns: string }
      purge_old_audit_logs:
        | { Args: never; Returns: number }
        | { Args: { retention_days?: number }; Returns: number }
      purge_old_user_sessions: {
        Args: { retention_days?: number }
        Returns: number
      }
      search_public_profiles: {
        Args: { result_limit?: number; search_term: string }
        Returns: {
          avatar_url: string
          display_name: string
          graduation_year: number
          player_position: string
          user_id: string
        }[]
      }
      update_certification_statuses: { Args: never; Returns: undefined }
      verify_certificate_public: {
        Args: { cert_number: string }
        Returns: Json
      }
      verify_course_certificate: {
        Args: { cert_number: string }
        Returns: Json
      }
    }
    Enums: {
      admin_cert_status: "Active" | "Expiring" | "Expired" | "Locked"
      admin_cert_type:
        | "Foundations"
        | "Performance"
        | "Catcher"
        | "Infield"
        | "Outfield"
        | "Softball Hitting Foundations"
        | "Softball Hitting Performance"
        | "Softball Slap Specialist"
        | "Catcher Specialist"
        | "Infield Specialist"
        | "Outfield Specialist"
      app_role: "admin" | "coach" | "athlete"
      badge_level:
        | "foundations"
        | "performance"
        | "specialist"
        | "pro"
        | "director"
      certification_status: "active" | "expired" | "revoked"
      certification_type:
        | "foundations"
        | "performance"
        | "catcher_specialist"
        | "infield_specialist"
        | "outfield_specialist"
        | "softball_foundations"
        | "softball_performance"
        | "softball_pitching_specialist"
        | "softball_hitting_specialist"
        | "softball_defense_specialist"
        | "softball_hitting_foundations"
        | "softball_hitting_performance"
        | "softball_slap_specialist"
      coach_role: "Coach" | "Director" | "OrgAdmin" | "VAULTHQ"
      coach_status: "Active" | "Suspended"
      device_type:
        | "rapsodo"
        | "hittrax"
        | "blast_motion"
        | "trackman"
        | "pocket_radar"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_cert_status: ["Active", "Expiring", "Expired", "Locked"],
      admin_cert_type: [
        "Foundations",
        "Performance",
        "Catcher",
        "Infield",
        "Outfield",
        "Softball Hitting Foundations",
        "Softball Hitting Performance",
        "Softball Slap Specialist",
        "Catcher Specialist",
        "Infield Specialist",
        "Outfield Specialist",
      ],
      app_role: ["admin", "coach", "athlete"],
      badge_level: [
        "foundations",
        "performance",
        "specialist",
        "pro",
        "director",
      ],
      certification_status: ["active", "expired", "revoked"],
      certification_type: [
        "foundations",
        "performance",
        "catcher_specialist",
        "infield_specialist",
        "outfield_specialist",
        "softball_foundations",
        "softball_performance",
        "softball_pitching_specialist",
        "softball_hitting_specialist",
        "softball_defense_specialist",
        "softball_hitting_foundations",
        "softball_hitting_performance",
        "softball_slap_specialist",
      ],
      coach_role: ["Coach", "Director", "OrgAdmin", "VAULTHQ"],
      coach_status: ["Active", "Suspended"],
      device_type: [
        "rapsodo",
        "hittrax",
        "blast_motion",
        "trackman",
        "pocket_radar",
      ],
    },
  },
} as const
