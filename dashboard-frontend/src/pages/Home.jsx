import { useEffect, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import ProjectODINLogo from '../assets/ProjectODINLogo.png'
import './Home.css'

const WS_URL  = 'ws://localhost:8080/ws'
const API_BASE = 'http://localhost:8080/api/messages'

// ── Parsers ────────────────────────────────────────────────────────────────

/**
 * Parses the Lombok toString format:
 *   Message(id=X, messageId=X, type=X, content=X, timestamp=X)
 */
function parseLombokMessage(raw) {
  try {
    const inner        = raw.slice('Message('.length, -1)
    const typeMatch    = inner.match(/type=([^,]+), /)
    const contentStart = inner.indexOf('content=') + 'content='.length
    const tsIdx        = inner.lastIndexOf(', timestamp=')
    return {
      type:      typeMatch?.[1]?.trim(),
      content:   inner.slice(contentStart, tsIdx),
      timestamp: inner.slice(tsIdx + ', timestamp='.length),
    }
  } catch {
    return null
  }
}

const TIME_FMT_LOC = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
const fmtLocal = d => (d instanceof Date && !isNaN(d)) ? d.toLocaleTimeString([], TIME_FMT_LOC) : '—'

function fmtElapsed(secs) {
  if (secs == null) return '—'
  const s = Math.floor(secs)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sc = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`
}

/**
 * Breaks semicolon-delimited content into a typed object.
 * ICD layout:
 *   TIME : <SECONDS_SINCE_LAUNCH>
 *   EPDS : ROCKET_V;12V_V;5V_V;3V3_V
 *   ADS  : IMU1_R…IMU1_GZ;IMU2_R…IMU2_GZ  (26 fields)
 *   AI   : PREDICTION,CONFIDENCE
 *   SPEC : BIN1;BIN2;…;BIN4096
 */
function parseContent(type, content) {
  const f = content.split(';')
  switch (type) {
    case 'EPDS': return { rocket: f[0], v12: f[1], v5: f[2], v3v3: f[3] }
    case 'AI': { const a = content.split(','); return { prediction: a[0], confidence: a[1] } }
    case 'SPEC': return f.map(Number)
    case 'TIME': return { elapsed: Number(f[0]) }
    case 'ADS': {
      const imu = o => ({
        roll: f[o],   pitch: f[o+1], qw: f[o+2], qx: f[o+3], qy: f[o+4],
        qz:   f[o+5], gx:   f[o+6], gy: f[o+7], gz: f[o+8],
        ax:   f[o+9], ay:   f[o+10], az: f[o+11], extra: f[o+12],
      })
      return { imu1: imu(0), imu2: imu(13) }
    }
    default:     return null
  }
}

/** Groups 4096 bins into ~512 points by summing each group. */
function downsample(bins, target = 512) {
  const step   = Math.ceil(bins.length / target)
  const result = []
  for (let i = 0; i < bins.length; i += step) {
    const chunk = bins.slice(i, i + step)
    result.push({ channel: i, counts: chunk.reduce((s, v) => s + v, 0) })
  }
  return result
}

/** Normalises confidence to 0–100 regardless of whether input is 0–1 or 0–100. */
function toPercent(val) {
  const n = parseFloat(val)
  if (isNaN(n)) return 0
  return n <= 1.0 ? Math.round(n * 1000) / 10 : Math.round(n * 10) / 10
}

// ── Sub-components ─────────────────────────────────────────────────────────

function VoltageRow({ label, v }) {
  return (
    <tr>
      <td className="td-label">{label}</td>
      <td className="td-val">{v ?? '—'}<span className="td-unit"> V</span></td>
    </tr>
  )
}

function Waiting({ className = '' }) {
  return <div className={`waiting ${className}`}>Awaiting telemetry…</div>
}

const ADS_FIELDS = [
  { key: 'roll',  label: 'ROLL',   unit: '°'      },
  { key: 'pitch', label: 'PITCH',  unit: '°'      },
  { key: 'qw',    label: 'QW',     unit: ''       },
  { key: 'qx',    label: 'QX',     unit: ''       },
  { key: 'qy',    label: 'QY',     unit: ''       },
  { key: 'qz',    label: 'QZ',     unit: ''       },
  { key: 'gx',    label: 'GX',     unit: ' °/s'   },
  { key: 'gy',    label: 'GY',     unit: ' °/s'   },
  { key: 'gz',    label: 'GZ',     unit: ' °/s'   },
  { key: 'ax',    label: 'AX',     unit: ' m/s²'  },
  { key: 'ay',    label: 'AY',     unit: ' m/s²'  },
  { key: 'az',    label: 'AZ',     unit: ' m/s²'  },
  { key: 'extra', label: 'EXTRA',  unit: ''       },
]

function ImuTable({ label, imu }) {
  return (
    <div className="imu-section">
      <div className="imu-label">{label}</div>
      <table className="ads-table">
        <tbody>
          {ADS_FIELDS.map(({ key, label: fl, unit }) => (
            <tr key={key}>
              <td className="td-label">{fl}</td>
              <td className="td-val">
                {imu[key] ?? '—'}
                {imu[key] != null && unit && <span className="td-unit">{unit}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function Home() {
  const [connected,   setConnected]   = useState(false)
  const [epds,        setEpds]        = useState(null)
  const [ai,          setAi]          = useState(null)
  const [spec,        setSpec]        = useState(null)
  const [ads,         setAds]         = useState(null)
  const [elapsed,         setElapsed]         = useState(null)
  const [lastReceiveTime, setLastReceiveTime] = useState(null)
  const [now,             setNow]             = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const apply = useCallback((type, content, updateTime = false) => {
    const data = parseContent(type, content)
    if (!data) return
    if (updateTime) setLastReceiveTime(new Date())
    if (type === 'TIME') setElapsed(data.elapsed)
    if (type === 'EPDS') setEpds(data)
    if (type === 'AI')   setAi(data)
    if (type === 'SPEC') setSpec(data)
    if (type === 'ADS')  setAds(data)
  }, [])

  // Load most-recent snapshot for each panel on mount (no time update — historical data)
  useEffect(() => {
    ;['EPDS', 'AI', 'SPEC', 'ADS'].forEach(type => {
      fetch(`${API_BASE}/latest/${type}`)
        .then(r => { if (r.ok) return r.json(); throw new Error() })
        .then(msg => apply(type, msg.content, false))
        .catch(() => {})
    })
  }, [apply])

  // Live WebSocket feed
  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/messages', frame => {
          const parsed = parseLombokMessage(frame.body)
          if (parsed?.type && parsed?.content != null)
            apply(parsed.type, parsed.content, true)
        })
      },
      onDisconnect:  () => setConnected(false),
      onStompError:  () => setConnected(false),
    })
    client.activate()
    return () => client.deactivate()
  }, [apply])

  const specData      = spec ? downsample(spec) : null
  const confidencePct = ai   ? toPercent(ai.confidence) : 0
  const confClass     = confidencePct >= 75 ? 'high' : confidencePct >= 45 ? 'mid' : 'low'
  const isStale       = lastReceiveTime !== null && (now - lastReceiveTime) > 60_000
  const isLive        = connected && !isStale

  return (
    <div className="dash">

      {/* ── Top bar ── */}
      <div className="dash-topbar">
        <img src={ProjectODINLogo} alt="Project ODIN" className="dash-logo" />
        <div className="dash-status">
          <span className={`status-dot ${isLive ? 'on' : 'off'}`} />
          <span className="status-label">{isLive ? 'LIVE' : 'OFFLINE'}</span>
          <span className="status-sep" />
          <span className="status-field">
            <span className="status-field-key">T+</span>
            <span className="status-time">{fmtElapsed(elapsed)}</span>
          </span>
          <span className="status-sep" />
          <span className="status-time">{fmtLocal(now)}</span>
        </div>
      </div>

      {/* ── Two-column panel row ── */}
      <div className="dash-grid">

        {/* EPDS – Power */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">POWER</span>
            <span className="card-sub">EPDS</span>
          </div>
          <table className="power-table">
            <thead>
              <tr>
                <th>Rail</th>
                <th>Voltage</th>
              </tr>
            </thead>
            <tbody>
              {epds ? (
                <>
                  <VoltageRow label="ROCKET" v={epds.rocket} />
                  <VoltageRow label="12 V"   v={epds.v12}    />
                  <VoltageRow label="5 V"    v={epds.v5}     />
                  <VoltageRow label="3.3 V"  v={epds.v3v3}   />
                </>
              ) : (
                <tr><td colSpan={2}><Waiting /></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* AI – Prediction */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">AI</span>
            <span className="card-sub">PREDICTION</span>
          </div>

          {ai ? (
            <div className="ai-body">
              <div className="ai-prediction">{ai.prediction}</div>
              <div className="ai-conf">
                <div className="conf-row">
                  <span className="conf-key">CONFIDENCE</span>
                  <span className="conf-pct">{confidencePct}%</span>
                </div>
                <div className="conf-track">
                  <div className={`conf-fill ${confClass}`} style={{ width: `${confidencePct}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <Waiting className="ai-waiting" />
          )}
        </div>
      </div>

      {/* ── Spectrometer – full width ── */}
      <div className="card">
        <div className="card-head">
          <span className="card-title">SPECTROMETER</span>
          <span className="card-sub">GAMMA RAY SPECTRUM · 4096 BINS</span>
        </div>

        {specData ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={specData} margin={{ top: 8, right: 24, bottom: 32, left: 8 }}>
              <defs>
                <linearGradient id="specGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#be2921" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#be2921" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
              <XAxis
                dataKey="channel"
                tick={{ fill: '#6e7681', fontSize: 11 }}
                label={{ value: 'Channel', position: 'insideBottomRight', offset: -4, fill: '#6e7681', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: '#6e7681', fontSize: 11 }}
                label={{ value: 'Counts', angle: -90, position: 'insideLeft', offset: 10, fill: '#6e7681', fontSize: 12 }}
                width={58}
              />
              <Tooltip
                contentStyle={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  color: '#e6edf3',
                  fontSize: 12,
                }}
                labelFormatter={v => `Channel ${v}`}
                formatter={v => [v.toLocaleString(), 'Counts']}
              />
              <Area
                type="monotone"
                dataKey="counts"
                stroke="#be2921"
                strokeWidth={1.5}
                fill="url(#specGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Waiting className="spec-waiting" />
        )}
      </div>

      {/* ── ADS – full width ── */}
      <div className="card">
        <div className="card-head">
          <span className="card-title">ATTITUDE</span>
          <span className="card-sub">ADS · DUAL IMU</span>
        </div>
        {ads ? (
          <div className="ads-grid">
            <ImuTable label="IMU 1" imu={ads.imu1} />
            <ImuTable label="IMU 2" imu={ads.imu2} />
          </div>
        ) : (
          <Waiting />
        )}
      </div>

    </div>
  )
}
