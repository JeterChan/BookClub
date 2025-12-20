import http from 'k6/http';
import { check } from 'k6';

// 從環境變數讀取 RPS 和持續時間
const rps = parseInt(__ENV.RPS) || 100;
const duration = __ENV.DURATION || '10s';

export const options = {
  scenarios: {
    constant_rps: {
      executor: 'constant-arrival-rate',
      rate: rps,
      timeUnit: '1s',
      duration: duration,
      preAllocatedVUs: rps * 1, // 根據經驗，預分配 RPS 的一倍 (修正)
      maxVUs: rps * 1, // 設置一個合理的上限
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'http_req_duration{status:200}': ['p(95)<500'],
  },
};

export default function () {
  const res = http.get('http://localhost:8000/api/v1/clubs/1');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
