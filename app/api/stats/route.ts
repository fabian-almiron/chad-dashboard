import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const [cpuInfo, memInfo, diskInfo, uptimeInfo, networkInfo, tailscaleInfo, openclawStatus, openclawProcess] = await Promise.all([
      execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1"),
      execAsync("free -m | awk 'NR==2{printf \"%s,%s,%.1f\", $3, $2, $3*100/$2}'"),
      execAsync("df -h / | awk 'NR==2{printf \"%s,%s,%s\", $3, $2, $5}'"),
      execAsync("uptime -p"),
      execAsync("hostname -I | awk '{print $1}'"),
      execAsync("tailscale ip -4 2>/dev/null || echo ''"),
      execAsync("systemctl --user is-active openclaw-gateway").catch(() => ({ stdout: 'inactive' })),
      execAsync("ps aux | grep 'openclaw-gateway' | grep -v grep | awk '{printf \"%s,%s,%s\", $2, $3, $4}'").catch(() => ({ stdout: ',,' }))
    ]);

    const [memUsed, memTotal, memPercent] = memInfo.stdout.trim().split(',');
    const [diskUsed, diskTotal, diskPercent] = diskInfo.stdout.trim().split(',');
    const [openclawPid, openclawCpu, openclawMem] = openclawProcess.stdout.trim().split(',');

    const modelInfo = await execAsync("journalctl --user -u openclaw-gateway -n 100 --no-pager | grep 'agent model:' | tail -1 | sed 's/.*agent model: //'").catch(() => ({ stdout: 'N/A' }));
    const whatsappStatus = await execAsync("journalctl --user -u openclaw-gateway -n 50 --no-pager | grep -i 'whatsapp.*listening' | tail -1").catch(() => ({ stdout: '' }));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      system: {
        hostname: 'homebot',
        uptime: uptimeInfo.stdout.trim(),
        cpu: {
          usage: parseFloat(cpuInfo.stdout.trim())
        },
        memory: {
          used: memUsed,
          total: memTotal,
          percent: parseFloat(memPercent)
        },
        disk: {
          used: diskUsed,
          total: diskTotal,
          percent: diskPercent
        },
        network: {
          localIp: networkInfo.stdout.trim(),
          tailscaleIp: tailscaleInfo.stdout.trim() || 'Not connected'
        }
      },
      openclaw: {
        status: openclawStatus.stdout.trim(),
        running: openclawStatus.stdout.trim() === 'active',
        pid: openclawPid || 'N/A',
        cpu: openclawCpu || '0',
        memory: openclawMem || '0',
        model: modelInfo.stdout.trim() || 'N/A',
        whatsapp: whatsappStatus.stdout.trim().length > 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
