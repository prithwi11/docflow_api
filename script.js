import http from 'k6/http';
import { check } from 'k6';
import encoding from 'k6/encoding';

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
    file: http.file(binFile, '1.png', 'image/jpeg'),
  };

  const res = http.post('http://localhost:3000/v1/file/upload', payload, {
    timeout: '60s',
  });

  check(res, {
    'status 200': (r) => r.status === 200,
    'upload successful': (r) => r.json('message') !== undefined,
  });
}