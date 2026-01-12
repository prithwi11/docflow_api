import http from 'k6/http';
import { check } from 'k6';
import encoding from 'k6/encoding';

const binFile = open('/home/sagar/Downloads/lukasz-szmigiel-Uw9DfCe2e7A-unsplash.jpg', 'b');

export const options = {
  stages: [
    { duration: '30s', target: 2 },
    { duration: '30s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 30 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const payload = {
    file: http.file(binFile, 'lukasz-szmigiel-Uw9DfCe2e7A-unsplash.jpg', 'image/jpeg'),
  };

  const res = http.post('http://localhost:3000/v1/file/upload', payload, {
    timeout: '60s',
  });

  check(res, {
    'status 200': (r) => r.status === 200,
    'upload successful': (r) => r.json('message') !== undefined,
  });
}