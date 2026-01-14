import http from 'k6/http';
import { check } from 'k6';

const binFile = open('/home/sagar/Pictures/1.png', 'b');

export const options = {
  stages: [
    { duration: '30s', target: 30 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 500 },
    { duration: '30s', target: 1000 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const payload = {
    file: http.file(binFile, '1.png', 'image/png'),
  };

  const res = http.post(
    'http://localhost:3000/v1/file/upload',
    payload,
    { timeout: '60s' }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,

    'response has body': (r) => r.body !== null,

    'response is JSON': (r) =>
      r.headers['Content-Type'] &&
      r.headers['Content-Type'].includes('application/json'),

    'upload successful': (r) => {
      if (r.status !== 200 || !r.body) return false;
      try {
        const body = r.json();
        return body.message !== undefined;
      } catch (e) {
        return false;
      }
    },
  });
}
