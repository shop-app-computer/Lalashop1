import React from 'react';
import { Monitor, Smartphone, AlertTriangle } from 'lucide-react';

type Result = 'success' | 'failed';

const data: { id: string; date: string; ip: string; country: string; city: string; device: string; browser: string; os: string; result: Result; flagged?: string }[] = [
  { id: 'L-3001', date: '2024-04-23 15:45:00', ip: '192.168.1.45', country: 'LA', city: 'Vientiane', device: 'desktop', browser: 'Chrome 124', os: 'Windows 11', result: 'success' },
  { id: 'L-3000', date: '2024-04-23 09:00:11', ip: '110.164.2.5', country: 'TH', city: 'Bangkok', device: 'mobile', browser: 'Safari 17', os: 'iOS 17.4', result: 'success', flagged: 'unusual location' },
  { id: 'L-2999', date: '2024-04-22 22:31:08', ip: '192.168.1.45', country: 'LA', city: 'Vientiane', device: 'desktop', browser: 'Chrome 124', os: 'Windows 11', result: 'failed', flagged: 'wrong password' },
  { id: 'L-2998', date: '2024-04-22 22:30:45', ip: '192.168.1.45', country: 'LA', city: 'Vientiane', device: 'desktop', browser: 'Chrome 124', os: 'Windows 11', result: 'failed', flagged: 'wrong password' },
  { id: 'L-2997', date: '2024-04-22 18:15:00', ip: '192.168.1.45', country: 'LA', city: 'Vientiane', device: 'desktop', browser: 'Chrome 124', os: 'Windows 11', result: 'success' },
  { id: 'L-2996', date: '2024-04-21 08:10:22', ip: '192.168.1.45', country: 'LA', city: 'Vientiane', device: 'mobile', browser: 'Chrome 124', os: 'Android 14', result: 'success' },
];

const LoginDeviceTab = () => {
  const uniqueIps = new Set(data.map((d) => d.ip)).size;
  const uniqueDevices = new Set(data.map((d) => `${d.device}-${d.os}`)).size;
  const countries = new Set(data.map((d) => d.country)).size;
  const failed24h = data.filter((d) => d.result === 'failed').length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
        <div>
          <p className="text-gray-500">unique ips</p>
          <p className="text-base font-bold tabular-nums">{uniqueIps}</p>
        </div>
        <div>
          <p className="text-gray-500">unique devices</p>
          <p className="text-base font-bold tabular-nums">{uniqueDevices}</p>
        </div>
        <div>
          <p className="text-gray-500">countries</p>
          <p className="text-base font-bold tabular-nums">{countries}</p>
        </div>
        <div>
          <p className="text-gray-500">failed (recent)</p>
          <p className="text-base font-bold tabular-nums text-red-700">{failed24h}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] tabular-nums">
          <thead className="text-[11px] text-gray-500 tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">date</th>
              <th className="px-4 py-2 text-left font-semibold">ip</th>
              <th className="px-4 py-2 text-left font-semibold">location</th>
              <th className="px-4 py-2 text-left font-semibold">device</th>
              <th className="px-4 py-2 text-left font-semibold">browser / os</th>
              <th className="px-4 py-2 text-left font-semibold">result</th>
              <th className="px-4 py-2 text-left font-semibold">flag</th>
            </tr>
          </thead>
          <tbody>
            {data.map((l) => (
              <tr key={l.id} className="border-t border-gray-50">
                <td className="px-4 py-2 text-gray-500 text-[11px]">{l.date}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{l.ip}</td>
                <td className="px-4 py-2 text-gray-700">{l.city}, {l.country}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-700">
                    {l.device === 'mobile' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />} {l.device}
                  </span>
                </td>
                <td className="px-4 py-2 text-[11px] text-gray-600">
                  {l.browser}
                  <br />
                  <span className="text-gray-400">{l.os}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${l.result === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {l.result}
                  </span>
                </td>
                <td className="px-4 py-2 text-[11px] text-amber-700">
                  {l.flagged && (
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {l.flagged}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginDeviceTab;
