import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DeviceType, DeviceMetric, DeviceIntegration, MetricShareToken } from "@/types/deviceMetrics";

export function useDeviceIntegrations(userId?: string) {
  return useQuery({
    queryKey: ['device-integrations', userId],
    queryFn: async () => {
      if (!userId) return [];
      // Use the safe view that excludes sensitive credentials (api_key, api_secret, tokens)
      const { data, error } = await supabase
        .from('device_integrations_safe')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      // Map to DeviceIntegration type (credentials will be undefined)
      return (data as Array<Omit<DeviceIntegration, 'api_key' | 'api_secret' | 'access_token' | 'refresh_token'>>).map(d => ({
        ...d,
        api_key: undefined,
        api_secret: undefined,
        access_token: undefined,
        refresh_token: undefined
      })) as DeviceIntegration[];
    },
    enabled: !!userId
  });
}

export function useDeviceMetrics(userId?: string, category?: string, deviceType?: DeviceType) {
  return useQuery({
    queryKey: ['device-metrics', userId, category, deviceType],
    queryFn: async () => {
      if (!userId) return [];
      let query = supabase
        .from('device_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(500);
      
      if (category) {
        query = query.eq('metric_category', category);
      }
      if (deviceType) {
        query = query.eq('device_type', deviceType as any);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DeviceMetric[];
    },
    enabled: !!userId
  });
}

export function useMetricShareTokens(userId?: string) {
  return useQuery({
    queryKey: ['metric-share-tokens', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('metric_share_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MetricShareToken[];
    },
    enabled: !!userId
  });
}

export function useAddDeviceIntegration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, deviceType, apiKey }: { 
      userId: string; 
      deviceType: DeviceType; 
      apiKey?: string 
    }) => {
      const { error } = await supabase
        .from('device_integrations')
        .upsert({
          user_id: userId,
          device_type: deviceType as any,
          api_key: apiKey,
          is_connected: !!apiKey
        } as any, { onConflict: 'user_id,device_type' });
      
      if (error) throw error;
      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-integrations'] });
      toast.success('Device integration added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add integration: ${error.message}`);
    }
  });
}

export function useAddMetric() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metric: Omit<DeviceMetric, 'id' | 'created_at'>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = metric;
      const insertPayload = {
        ...rest,
        raw_data: raw_data ? JSON.parse(JSON.stringify(raw_data)) : null
      };
      const { data, error } = await supabase
        .from('device_metrics')
        .insert(insertPayload as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-metrics'] });
      toast.success('Metric recorded');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record metric: ${error.message}`);
    }
  });
}

export function useBulkAddMetrics() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metrics: Omit<DeviceMetric, 'id' | 'created_at'>[]) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const insertData = metrics.map(({ raw_data, ...rest }) => ({
        ...rest,
        raw_data: raw_data ? JSON.parse(JSON.stringify(raw_data)) : null
      }));
      const { data, error } = await supabase
        .from('device_metrics')
        .insert(insertData as any)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['device-metrics'] });
      toast.success(`${data.length} metrics imported`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to import metrics: ${error.message}`);
    }
  });
}

export function useCreateShareToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (token: Omit<MetricShareToken, 'id' | 'view_count' | 'last_viewed_at' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('metric_share_tokens')
        .insert(token)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metric-share-tokens'] });
      toast.success('Share link created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create share link: ${error.message}`);
    }
  });
}

export function useDeleteShareToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from('metric_share_tokens')
        .delete()
        .eq('id', tokenId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metric-share-tokens'] });
      toast.success('Share link deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete share link: ${error.message}`);
    }
  });
}

export function useSharedMetrics(token?: string) {
  return useQuery({
    queryKey: ['shared-metrics', token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase
        .rpc('get_shared_metrics', { share_token: token });
      
      if (error) throw error;
      return data;
    },
    enabled: !!token
  });
}
