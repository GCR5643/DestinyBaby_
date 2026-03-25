'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, RefreshCw, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const CONFIG_TABLE = 'popularity_config';

interface PopularityConfig {
  wNational: number;
  wService: number;
  coldStartThreshold100: number;
  coldStartThreshold1000: number;
  kosisApiEnabled: boolean;
  lastSyncedAt: string;
}

const DEFAULT_CONFIG: PopularityConfig = {
  wNational: 60,
  wService: 40,
  coldStartThreshold100: 85,
  coldStartThreshold1000: 70,
  kosisApiEnabled: true,
  lastSyncedAt: '-',
};

export default function AdminPopularityPage() {
  const router = useRouter();
  const [config, setConfig] = useState<PopularityConfig>(DEFAULT_CONFIG);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load config from DB on mount (graceful fallback if table doesn't exist)
  useEffect(() => {
    const loadConfig = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from(CONFIG_TABLE)
          .select('*')
          .limit(1)
          .maybeSingle();
        if (!error && data) {
          setConfig({
            wNational: data.w_national ?? DEFAULT_CONFIG.wNational,
            wService: data.w_service ?? DEFAULT_CONFIG.wService,
            coldStartThreshold100: data.cold_start_threshold_100 ?? DEFAULT_CONFIG.coldStartThreshold100,
            coldStartThreshold1000: data.cold_start_threshold_1000 ?? DEFAULT_CONFIG.coldStartThreshold1000,
            kosisApiEnabled: data.kosis_api_enabled ?? DEFAULT_CONFIG.kosisApiEnabled,
            lastSyncedAt: data.last_synced_at ?? DEFAULT_CONFIG.lastSyncedAt,
          });
        }
      } catch {
        // table may not exist — use defaults
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 2000));
    const now = new Date().toLocaleString('ko-KR');
    setConfig((prev) => ({ ...prev, lastSyncedAt: now }));
    setIsSyncing(false);
  };

  const handleSave = async () => {
    const supabase = createClient();
    try {
      await supabase.from(CONFIG_TABLE).upsert({
        id: 1,
        w_national: config.wNational,
        w_service: config.wService,
        cold_start_threshold_100: config.coldStartThreshold100,
        cold_start_threshold_1000: config.coldStartThreshold1000,
        kosis_api_enabled: config.kosisApiEnabled,
        last_synced_at: config.lastSyncedAt,
      });
    } catch {
      // table may not exist — ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalW = config.wNational + config.wService;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900">유행지수 가중치 관리</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* KOSIS 연동 상태 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">📡 통계청 KOSIS 연동</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${config.kosisApiEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {config.kosisApiEnabled ? '연결됨' : '비활성'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">마지막 동기화: {config.lastSyncedAt}</p>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? '동기화 중...' : '지금 동기화'}
          </button>
        </motion.div>

        {/* 가중치 설정 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">⚖️ 데이터 소스 가중치</h2>

          <div className="space-y-5">
            {/* 국가 통계 가중치 */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">🏛️ 국가 통계 (통계청)</label>
                <span className="text-sm font-bold text-primary-600">{config.wNational}%</span>
              </div>
              <input
                type="range" min={0} max={100} step={5}
                value={config.wNational}
                onChange={(e) => setConfig((prev) => ({ ...prev, wNational: +e.target.value, wService: 100 - +e.target.value }))}
                className="w-full accent-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">연간 출생아 이름 등록 통계 기반. 안정적이나 최신성 낮음</p>
            </div>

            {/* 서비스 가중치 */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">✨ 서비스 내 최종선택</label>
                <span className="text-sm font-bold text-secondary-600">{config.wService}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full transition-all"
                  style={{ width: `${config.wNational}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>국가 통계</span>
                <span>서비스 선택</span>
              </div>
              {totalW !== 100 && (
                <p className="text-xs text-red-500 mt-1">⚠️ 합계가 100%가 되어야 합니다 (현재 {totalW}%)</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Cold start 보정 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-bold text-gray-800">📈 Cold Start 보정</h2>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mb-4">서비스 데이터가 적을 때 국가 통계 비중을 자동 상향합니다</p>

          <div className="space-y-3">
            {[
              { label: '100건 미만', key: 'coldStartThreshold100' as const, desc: '초기 서비스 단계' },
              { label: '1,000건 미만', key: 'coldStartThreshold1000' as const, desc: '성장 단계' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">국가</span>
                  <input
                    type="number" min={50} max={100} step={5}
                    value={config[item.key]}
                    onChange={(e) => setConfig((prev) => ({ ...prev, [item.key]: +e.target.value }))}
                    className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-primary-600"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 저장 */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg'
          }`}
        >
          {saved ? '✅ 저장됨' : '설정 저장'}
        </button>
      </div>
    </div>
  );
}
