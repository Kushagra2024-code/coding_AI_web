import { useEffect, useState } from 'react'
import { fetchAnalytics } from '../api/coding'
import type { AnalyticsResponse } from '../types/api'
import Layout from '../components/common/Layout'
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts'
import { TrendingUp, Award, Zap, History, BrainCircuit } from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><span className="animate-pulse text-emerald-400 font-mono">Initializing Neural Dashboard...</span></div></Layout>

  const chartData = data?.recentActivity.map(item => ({
    name: new Date(item.timestamp).toLocaleDateString(),
    score: item.score
  })).reverse() ?? []

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white tracking-tight">Performance <span className="text-emerald-400">Analytics</span></h1>
          <p className="text-slate-400 mt-1">Track your progress across coding and system design disciplines.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem label="Total Sessions" value={data?.summary.totalSessions ?? 0} icon={History} color="emerald" />
          <StatItem label="Average Score" value={`${data?.summary.avgOverallScore ?? 0}%`} icon={Award} color="blue" />
          <StatItem label="Submissions" value={data?.summary.totalSubmissions ?? 0} icon={Zap} color="amber" />
          <StatItem label="Topics Mastered" value={data?.topicStrengths.filter(t => t.averageCorrectness > 80).length ?? 0} icon={BrainCircuit} color="purple" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Performance Chart */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" /> Improvement Graph
              </h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Topic Strengths */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl">
            <h2 className="font-bold text-white mb-6 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-blue-400" /> Skill Breakdown
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.topicStrengths.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="tag" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Bar dataKey="averageCorrectness" radius={[6, 6, 0, 0]} barSize={32}>
                    {data?.topicStrengths.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Recent Activity Table */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm overflow-hidden">
          <h2 className="font-bold text-white mb-4">Recent Sessions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-medium">
                  <th className="pb-4 px-2">Discipline</th>
                  <th className="pb-4 px-2">Focus</th>
                  <th className="pb-4 px-2 text-right">Score</th>
                  <th className="pb-4 px-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {data?.recentActivity.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'coding' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-2 font-medium text-slate-200">{item.label}</td>
                    <td className="py-4 px-2 text-right">
                      <span className={`font-mono font-bold ${
                        item.score >= 80 ? 'text-emerald-400' : item.score >= 50 ? 'text-blue-400' : 'text-rose-400'
                      }`}>
                        {item.score}%
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right text-slate-500 font-mono text-xs">
                      {new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  )
}

function StatItem({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition-all hover:-translate-y-1">
      <div className={`inline-flex p-2 rounded-xl border mb-4 ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{label}</p>
    </div>
  )
}
