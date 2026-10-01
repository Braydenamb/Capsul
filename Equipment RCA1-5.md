## Merged Files List
- 1. Equipment Performance - RCA1 PU-2101B.md (4 KB)
- 2. Equipment Performance - RCA2 KO-3201.md (4.1 KB)
- 3. Equipment Performance - RCA3 PM-4405B.md (4.1 KB)
- 4. Equipment Performance - RCA4 HE-3301.md (4 KB)
- 5. Equipment Performance - RCA5 BL-5702.md (4 KB)


## 1. Equipment Performance - RCA1 PU-2101B.md

```md
## Equipment Info
| EQUIPMENT PERFORMANCE — CONDITION MONITORING RECORD | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 |
| --- | --- | --- | --- |
| NaN | NaN | NaN | NaN |
| NAMEPLATE / IDENTIFICATION | NaN | MONITORED PARAMETERS & LIMITS | NaN |
| Equipment Tag | PU-2101B | Parameter | Alarm / Trip |
| Equipment Name | Feed Charge Pump PU-2101B | Overall Vibration (mm/s) | 7.0 / 11.0 |
| Equipment Type | Centrifugal Pump | Seal Flush Flow (L/min) | 5.0 / 4.0 |
| Equipment Class | B | Discharge Pressure (barg) | 8.5 / 7.5 |
| Plant / Unit | Resin Plant (ARP) | Bearing Temp (°C) | 80 / 95 |
| Discipline | ROT | NaN | NaN |
| Criticality | Medium | NaN | NaN |
| Design Life | 5 years (bearing) / 24 months (seal element) | NaN | NaN |
| Monitoring Method | Online DCS + monthly vibration/thermography route | NaN | NaN |
| Linked RCA / AR No. | AR-2026-ARP-0117 | NaN | NaN |
| Failure Date | 12-Mar-2026 | NaN | NaN |
| Dominant Failure Mode | Mechanical Seal Leakage | NaN | NaN |

## Condition History
| Week | Date | Overall Vibration (mm/s) | Seal Flush Flow (L/min) | Discharge Pressure (barg) | Bearing Temp (°C) | Health Status | Remark |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2025-10-23 | 3.893 | 6.529 | 9.576 | 62.025 | NORMAL | NaN |
| 2 | 2025-10-30 | 3.941 | 6.467 | 9.549 | 63.051 | NORMAL | NaN |
| 3 | 2025-11-06 | 3.805 | 6.528 | 9.529 | 61.209 | NORMAL | NaN |
| 4 | 2025-11-13 | 4.062 | 6.384 | 9.593 | 62.580 | NORMAL | NaN |
| 5 | 2025-11-20 | 4.314 | 6.257 | 9.540 | 63.955 | NORMAL | NaN |
| 6 | 2025-11-27 | 4.420 | 6.365 | 9.454 | 64.237 | NORMAL | NaN |
| 7 | 2025-12-04 | 4.249 | 6.327 | 9.481 | 64.575 | NORMAL | NaN |
| 8 | 2025-12-11 | 4.430 | 6.229 | 9.354 | 66.064 | NORMAL | NaN |
| 9 | 2025-12-18 | 5.010 | 6.178 | 9.252 | 67.550 | NORMAL | NaN |
| 10 | 2025-12-25 | 5.437 | 6.032 | 9.197 | 69.353 | NORMAL | NaN |
| 11 | 2026-01-01 | 5.597 | 5.892 | 9.029 | 69.195 | NORMAL | NaN |
| 12 | 2026-01-08 | 6.115 | 5.691 | 8.969 | 71.414 | NORMAL | NaN |
| 13 | 2026-01-15 | 6.427 | 5.594 | 8.796 | 74.062 | NORMAL | NaN |
| 14 | 2026-01-22 | 6.874 | 5.385 | 8.737 | 76.229 | NORMAL | NaN |
| 15 | 2026-01-29 | 7.371 | 5.257 | 8.598 | 78.331 | ALARM | NaN |
| 16 | 2026-02-05 | 7.882 | 5.189 | 8.414 | 80.834 | ALARM | NaN |
| 17 | 2026-02-12 | 8.347 | 4.911 | 8.301 | 83.703 | ALARM | NaN |
| 18 | 2026-02-19 | 9.268 | 4.713 | 8.053 | 86.145 | ALARM | Degradation trend — under close monitoring |
| 19 | 2026-02-26 | 9.764 | 4.440 | 7.922 | 90.426 | ALARM | Degradation trend — under close monitoring |
| 20 | 2026-03-05 | 10.218 | 4.374 | 7.700 | 91.338 | ALARM | Degradation trend — under close monitoring |
| 21 | 2026-03-12 | 11.220 | 3.920 | 7.350 | 96.900 | TRIP | FAILURE — Mechanical Seal Leakage; unplanned downtime 18.5 h |
| 22 | 2026-03-19 | 3.624 | 6.231 | 9.554 | 58.931 | NORMAL | Post-repair baseline restored (CAPA executed) |
| 23 | 2026-03-26 | 3.770 | 6.512 | 9.768 | 61.511 | NORMAL | NaN |
| 24 | 2026-04-02 | 3.587 | 6.257 | 10.064 | 61.063 | NORMAL | NaN |
| 25 | 2026-04-09 | 3.692 | 6.251 | 9.428 | 60.562 | NORMAL | NaN |
| 26 | 2026-04-16 | 3.796 | 6.446 | 9.510 | 59.316 | NORMAL | NaN |

## Performance Summary
| PERFORMANCE SUMMARY — PU-2101B | Unnamed: 1 | Unnamed: 2 |
| --- | --- | --- |
| NaN | NaN | NaN |
| KPI | Value | Basis / Formula |
| Monitoring Period (weeks) | 26 | Number of weekly readings |
| Total Downtime (hours) | 18.5 | From linked RCA downtime window |
| Period Hours | 4368 | 4368 |
| Availability (%) | 99.576465 | (Period-Downtime)/Period |
| No. of Failures (period) | 1 | Failure events this period |
| MTBF (hours) | 4368 | Period Hours / No. of Failures |
| MTTR (hours) | 18.5 | Mean time to repair |
| ALARM readings | 6 | Count of ALARM weeks |
| TRIP readings | 1 | Count of TRIP weeks |
| NORMAL readings | 19 | Count of NORMAL weeks |
| PM Compliance (%) | 92 | PM completed vs scheduled |
| Production Loss (ton) | 251.6 | Downtime x rate loss (from RCA) |
| Estimated Loss (k USD) | 226.44 | Production loss x product price |
```

## 2. Equipment Performance - RCA2 KO-3201.md

```md
## Equipment Info
| EQUIPMENT PERFORMANCE — CONDITION MONITORING RECORD | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 |
| --- | --- | --- | --- |
| NaN | NaN | NaN | NaN |
| NAMEPLATE / IDENTIFICATION | NaN | MONITORED PARAMETERS & LIMITS | NaN |
| Equipment Tag | KO-3201 | Parameter | Alarm / Trip |
| Equipment Name | Cracked Gas Compressor KO-3201 | DE Radial Vibration (micron) | 45 / 75 |
| Equipment Type | Centrifugal Compressor | Lube Oil Water Content (ppm) | 500 / 1500 |
| Equipment Class | A | Lube Oil Supply Press (barg) | 1.4 / 1.1 |
| Plant / Unit | Cracker Unit (ZCU) | Bearing Metal Temp (°C) | 95 / 110 |
| Discipline | ROT | NaN | NaN |
| Criticality | High | NaN | NaN |
| Design Life | 5 years (bearing) / 24 months (seal element) | NaN | NaN |
| Monitoring Method | Online DCS + monthly vibration/thermography route | NaN | NaN |
| Linked RCA / AR No. | AR-2026-ZCU-0142 | NaN | NaN |
| Failure Date | 29-Apr-2026 | NaN | NaN |
| Dominant Failure Mode | High Radial Vibration Trip (Bearing Distress) | NaN | NaN |

## Condition History
| Week | Date | DE Radial Vibration (micron) | Lube Oil Water Content (ppm) | Lube Oil Supply Press (barg) | Bearing Metal Temp (°C) | Health Status | Remark |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2025-12-10 | 28.914 | 259.777 | 1.799 | 78.671 | NORMAL | NaN |
| 2 | 2025-12-17 | 26.899 | 299.796 | 1.776 | 77.664 | NORMAL | NaN |
| 3 | 2025-12-24 | 29.739 | 226.415 | 1.794 | 78.344 | NORMAL | NaN |
| 4 | 2025-12-31 | 29.024 | 255.766 | 1.790 | 78.499 | NORMAL | NaN |
| 5 | 2026-01-07 | 28.658 | 292.849 | 1.784 | 78.357 | NORMAL | NaN |
| 6 | 2026-01-14 | 30.289 | 350.734 | 1.748 | 80.498 | NORMAL | NaN |
| 7 | 2026-01-21 | 33.697 | 387.773 | 1.730 | 81.482 | NORMAL | NaN |
| 8 | 2026-01-28 | 33.930 | 384.412 | 1.733 | 81.741 | NORMAL | NaN |
| 9 | 2026-02-04 | 35.439 | 470.814 | 1.705 | 83.041 | NORMAL | NaN |
| 10 | 2026-02-11 | 37.665 | 501.213 | 1.635 | 84.892 | ALARM | NaN |
| 11 | 2026-02-18 | 39.586 | 587.811 | 1.633 | 87.153 | ALARM | NaN |
| 12 | 2026-02-25 | 41.609 | 630.011 | 1.602 | 87.657 | ALARM | NaN |
| 13 | 2026-03-04 | 45.505 | 713.736 | 1.538 | 90.790 | ALARM | NaN |
| 14 | 2026-03-11 | 49.237 | 778.644 | 1.518 | 92.431 | ALARM | NaN |
| 15 | 2026-03-18 | 51.111 | 840.660 | 1.454 | 92.528 | ALARM | NaN |
| 16 | 2026-03-25 | 55.927 | 929.853 | 1.401 | 95.961 | ALARM | NaN |
| 17 | 2026-04-01 | 59.123 | 1062.337 | 1.335 | 98.832 | ALARM | NaN |
| 18 | 2026-04-08 | 60.529 | 1135.420 | 1.313 | 100.992 | ALARM | Degradation trend — under close monitoring |
| 19 | 2026-04-15 | 66.730 | 1237.785 | 1.219 | 104.623 | ALARM | Degradation trend — under close monitoring |
| 20 | 2026-04-22 | 71.674 | 1372.791 | 1.122 | 107.142 | ALARM | Degradation trend — under close monitoring |
| 21 | 2026-04-29 | 76.500 | 1530.000 | 1.078 | 112.200 | TRIP | FAILURE — High Radial Vibration Trip (Bearing Distress); unplanned downtime 32.0 h |
| 22 | 2026-05-06 | 27.111 | 248.268 | 1.718 | 76.162 | NORMAL | Post-repair baseline restored (CAPA executed) |
| 23 | 2026-05-13 | 27.704 | 241.516 | 1.684 | 73.735 | NORMAL | NaN |
| 24 | 2026-05-20 | 26.920 | 244.244 | 1.840 | 77.070 | NORMAL | NaN |
| 25 | 2026-05-27 | 27.433 | 247.838 | 1.703 | 74.816 | NORMAL | NaN |
| 26 | 2026-06-03 | 27.234 | 241.781 | 1.730 | 77.771 | NORMAL | NaN |

## Performance Summary
| PERFORMANCE SUMMARY — KO-3201 | Unnamed: 1 | Unnamed: 2 |
| --- | --- | --- |
| NaN | NaN | NaN |
| KPI | Value | Basis / Formula |
| Monitoring Period (weeks) | 26 | Number of weekly readings |
| Total Downtime (hours) | 32 | From linked RCA downtime window |
| Period Hours | 4368 | 4368 |
| Availability (%) | 99.267399 | (Period-Downtime)/Period |
| No. of Failures (period) | 1 | Failure events this period |
| MTBF (hours) | 4368 | Period Hours / No. of Failures |
| MTTR (hours) | 32 | Mean time to repair |
| ALARM readings | 11 | Count of ALARM weeks |
| TRIP readings | 1 | Count of TRIP weeks |
| NORMAL readings | 14 | Count of NORMAL weeks |
| PM Compliance (%) | 92 | PM completed vs scheduled |
| Production Loss (ton) | 1760 | Downtime x rate loss (from RCA) |
| Estimated Loss (k USD) | 1584 | Production loss x product price |
```

## 3. Equipment Performance - RCA3 PM-4405B.md

```md
## Equipment Info
| EQUIPMENT PERFORMANCE — CONDITION MONITORING RECORD | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 |
| --- | --- | --- | --- |
| NaN | NaN | NaN | NaN |
| NAMEPLATE / IDENTIFICATION | NaN | MONITORED PARAMETERS & LIMITS | NaN |
| Equipment Tag | PM-4405B | Parameter | Alarm / Trip |
| Equipment Name | Cooling Water Pump PM-4405B (Motor Driven) | Motor DE Bearing Temp (°C) | 75 / 90 |
| Equipment Type | Centrifugal Pump / Electric Motor | Motor Vibration (mm/s) | 5.0 / 8.0 |
| Equipment Class | B | Motor Ampere (A) | 150 / 165 |
| Plant / Unit | Utility Plant (NUP) | Winding Temp (°C) | 120 / 140 |
| Discipline | ELE | NaN | NaN |
| Criticality | Medium | NaN | NaN |
| Design Life | 5 years (bearing) / 24 months (seal element) | NaN | NaN |
| Monitoring Method | Online DCS + monthly vibration/thermography route | NaN | NaN |
| Linked RCA / AR No. | AR-2026-NUP-0089 | NaN | NaN |
| Failure Date | 08-Jul-2026 | NaN | NaN |
| Dominant Failure Mode | Motor Bearing Failure (Overheating) | NaN | NaN |

## Condition History
| Week | Date | Motor DE Bearing Temp (°C) | Motor Vibration (mm/s) | Motor Ampere (A) | Winding Temp (°C) | Health Status | Remark |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-02-18 | 63.617 | 2.468 | 133.725 | 96.639 | NORMAL | NaN |
| 2 | 2026-02-25 | 64.040 | 2.443 | 131.366 | 94.458 | NORMAL | NaN |
| 3 | 2026-03-04 | 64.006 | 2.679 | 132.215 | 96.070 | NORMAL | NaN |
| 4 | 2026-03-11 | 64.940 | 2.618 | 132.454 | 96.361 | NORMAL | NaN |
| 5 | 2026-03-18 | 65.550 | 2.782 | 134.231 | 95.593 | NORMAL | NaN |
| 6 | 2026-03-25 | 65.645 | 3.003 | 133.577 | 96.823 | NORMAL | NaN |
| 7 | 2026-04-01 | 66.476 | 3.062 | 134.033 | 98.950 | NORMAL | NaN |
| 8 | 2026-04-08 | 66.851 | 3.201 | 134.385 | 99.369 | NORMAL | NaN |
| 9 | 2026-04-15 | 68.559 | 3.343 | 136.254 | 100.744 | NORMAL | NaN |
| 10 | 2026-04-22 | 69.633 | 3.706 | 138.690 | 103.699 | NORMAL | NaN |
| 11 | 2026-04-29 | 70.413 | 4.200 | 139.701 | 104.721 | NORMAL | NaN |
| 12 | 2026-05-06 | 71.385 | 4.132 | 142.763 | 108.321 | NORMAL | NaN |
| 13 | 2026-05-13 | 73.921 | 4.388 | 142.827 | 110.606 | NORMAL | NaN |
| 14 | 2026-05-20 | 74.537 | 4.838 | 145.824 | 114.327 | NORMAL | NaN |
| 15 | 2026-05-27 | 76.498 | 5.375 | 147.179 | 117.834 | ALARM | NaN |
| 16 | 2026-06-03 | 78.258 | 5.606 | 150.389 | 118.576 | ALARM | NaN |
| 17 | 2026-06-10 | 80.814 | 6.043 | 152.555 | 123.300 | ALARM | NaN |
| 18 | 2026-06-17 | 82.788 | 6.493 | 155.447 | 128.027 | ALARM | Degradation trend — under close monitoring |
| 19 | 2026-06-24 | 84.415 | 6.991 | 157.396 | 133.654 | ALARM | Degradation trend — under close monitoring |
| 20 | 2026-07-01 | 87.236 | 7.372 | 162.307 | 135.486 | ALARM | Degradation trend — under close monitoring |
| 21 | 2026-07-08 | 91.800 | 8.160 | 168.300 | 142.800 | TRIP | FAILURE — Motor Bearing Failure (Overheating); unplanned downtime 8.0 h |
| 22 | 2026-07-15 | 63.965 | 2.545 | 127.659 | 91.570 | NORMAL | Post-repair baseline restored (CAPA executed) |
| 23 | 2026-07-22 | 65.846 | 2.681 | 127.446 | 97.367 | NORMAL | NaN |
| 24 | 2026-07-29 | 64.984 | 2.428 | 127.592 | 92.001 | NORMAL | NaN |
| 25 | 2026-08-05 | 65.038 | 2.529 | 132.291 | 93.757 | NORMAL | NaN |
| 26 | 2026-08-12 | 64.849 | 2.528 | 131.854 | 94.427 | NORMAL | NaN |

## Performance Summary
| PERFORMANCE SUMMARY — PM-4405B | Unnamed: 1 | Unnamed: 2 |
| --- | --- | --- |
| NaN | NaN | NaN |
| KPI | Value | Basis / Formula |
| Monitoring Period (weeks) | 26 | Number of weekly readings |
| Total Downtime (hours) | 8 | From linked RCA downtime window |
| Period Hours | 4368 | 4368 |
| Availability (%) | 99.81685 | (Period-Downtime)/Period |
| No. of Failures (period) | 1 | Failure events this period |
| MTBF (hours) | 4368 | Period Hours / No. of Failures |
| MTTR (hours) | 8 | Mean time to repair |
| ALARM readings | 6 | Count of ALARM weeks |
| TRIP readings | 1 | Count of TRIP weeks |
| NORMAL readings | 19 | Count of NORMAL weeks |
| PM Compliance (%) | 92 | PM completed vs scheduled |
| Production Loss (ton) | 160 | Downtime x rate loss (from RCA) |
| Estimated Loss (k USD) | 112 | Production loss x product price |
```

## 4. Equipment Performance - RCA4 HE-3301.md

```md
## Equipment Info
| EQUIPMENT PERFORMANCE — CONDITION MONITORING RECORD | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 |
| --- | --- | --- | --- |
| NaN | NaN | NaN | NaN |
| NAMEPLATE / IDENTIFICATION | NaN | MONITORED PARAMETERS & LIMITS | NaN |
| Equipment Tag | HE-3301 | Parameter | Alarm / Trip |
| Equipment Name | Feed/Effluent Heat Exchanger HE-3301 | Tube-side dP (bar) | 0.6 / 0.9 |
| Equipment Type | Shell & Tube Heat Exchanger | Heat Duty (% design) | 90 / 70 |
| Equipment Class | B | Cold Outlet Temp (°C) | 110 / 95 |
| Plant / Unit | Cracker Unit (ZCU) | Feed Heavy-ends (%) | 1.5 / 2.4 |
| Discipline | STA | NaN | NaN |
| Criticality | Medium | NaN | NaN |
| Design Life | 5 years (bearing) / 24 months (seal element) | NaN | NaN |
| Monitoring Method | Online DCS + monthly vibration/thermography route | NaN | NaN |
| Linked RCA / AR No. | AR-2026-ZCU-0165 | NaN | NaN |
| Failure Date | 21-May-2026 | NaN | NaN |
| Dominant Failure Mode | High Fouling — Duty Loss & High dP | NaN | NaN |

## Condition History
| Week | Date | Tube-side dP (bar) | Heat Duty (% design) | Cold Outlet Temp (°C) | Feed Heavy-ends (%) | Health Status | Remark |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-01-01 | 0.355 | 100.285 | 120.151 | 1.169 | NORMAL | NaN |
| 2 | 2026-01-08 | 0.355 | 99.865 | 119.916 | 1.219 | NORMAL | NaN |
| 3 | 2026-01-15 | 0.347 | 100.659 | 119.757 | 1.209 | NORMAL | NaN |
| 4 | 2026-01-22 | 0.337 | 98.944 | 118.962 | 1.237 | NORMAL | NaN |
| 5 | 2026-01-29 | 0.370 | 98.631 | 119.005 | 1.263 | NORMAL | NaN |
| 6 | 2026-02-05 | 0.377 | 97.271 | 118.131 | 1.301 | NORMAL | NaN |
| 7 | 2026-02-12 | 0.399 | 96.484 | 118.234 | 1.254 | NORMAL | NaN |
| 8 | 2026-02-19 | 0.421 | 96.590 | 116.945 | 1.321 | NORMAL | NaN |
| 9 | 2026-02-26 | 0.458 | 95.815 | 116.352 | 1.337 | NORMAL | NaN |
| 10 | 2026-03-05 | 0.455 | 94.480 | 115.188 | 1.476 | NORMAL | NaN |
| 11 | 2026-03-12 | 0.496 | 93.082 | 113.710 | 1.500 | ALARM | NaN |
| 12 | 2026-03-19 | 0.517 | 90.360 | 112.245 | 1.552 | ALARM | NaN |
| 13 | 2026-03-26 | 0.540 | 90.324 | 110.721 | 1.631 | ALARM | NaN |
| 14 | 2026-04-02 | 0.570 | 87.662 | 109.747 | 1.725 | ALARM | NaN |
| 15 | 2026-04-09 | 0.602 | 85.105 | 108.077 | 1.791 | ALARM | NaN |
| 16 | 2026-04-16 | 0.635 | 83.143 | 105.479 | 1.837 | ALARM | NaN |
| 17 | 2026-04-23 | 0.705 | 80.300 | 103.841 | 1.979 | ALARM | NaN |
| 18 | 2026-04-30 | 0.751 | 77.895 | 102.087 | 2.094 | ALARM | Degradation trend — under close monitoring |
| 19 | 2026-05-07 | 0.785 | 75.868 | 99.789 | 2.161 | ALARM | Degradation trend — under close monitoring |
| 20 | 2026-05-14 | 0.854 | 72.706 | 97.922 | 2.288 | ALARM | Degradation trend — under close monitoring |
| 21 | 2026-05-21 | 0.918 | 68.600 | 93.100 | 2.448 | TRIP | FAILURE — High Fouling — Duty Loss & High dP; unplanned downtime 12.0 h |
| 22 | 2026-05-28 | 0.337 | 98.431 | 120.861 | 1.246 | NORMAL | Post-repair baseline restored (CAPA executed) |
| 23 | 2026-06-04 | 0.316 | 94.810 | 116.073 | 1.124 | NORMAL | NaN |
| 24 | 2026-06-11 | 0.319 | 100.654 | 118.936 | 1.154 | NORMAL | NaN |
| 25 | 2026-06-18 | 0.358 | 102.194 | 116.948 | 1.178 | NORMAL | NaN |
| 26 | 2026-06-25 | 0.352 | 96.643 | 115.475 | 1.182 | NORMAL | NaN |

## Performance Summary
| PERFORMANCE SUMMARY — HE-3301 | Unnamed: 1 | Unnamed: 2 |
| --- | --- | --- |
| NaN | NaN | NaN |
| KPI | Value | Basis / Formula |
| Monitoring Period (weeks) | 26 | Number of weekly readings |
| Total Downtime (hours) | 12 | From linked RCA downtime window |
| Period Hours | 4368 | 4368 |
| Availability (%) | 99.725275 | (Period-Downtime)/Period |
| No. of Failures (period) | 1 | Failure events this period |
| MTBF (hours) | 4368 | Period Hours / No. of Failures |
| MTTR (hours) | 12 | Mean time to repair |
| ALARM readings | 10 | Count of ALARM weeks |
| TRIP readings | 1 | Count of TRIP weeks |
| NORMAL readings | 15 | Count of NORMAL weeks |
| PM Compliance (%) | 92 | PM completed vs scheduled |
| Production Loss (ton) | 216 | Downtime x rate loss (from RCA) |
| Estimated Loss (k USD) | 183.6 | Production loss x product price |
```

## 5. Equipment Performance - RCA5 BL-5702.md

```md
## Equipment Info
| EQUIPMENT PERFORMANCE — CONDITION MONITORING RECORD | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 |
| --- | --- | --- | --- |
| NaN | NaN | NaN | NaN |
| NAMEPLATE / IDENTIFICATION | NaN | MONITORED PARAMETERS & LIMITS | NaN |
| Equipment Tag | BL-5702 | Parameter | Alarm / Trip |
| Equipment Name | Product Blower BL-5702 | Overall Vibration (mm/s) | 7.0 / 11.0 |
| Equipment Type | Centrifugal Blower | 2X Harmonic (mm/s) | 3.0 / 5.0 |
| Equipment Class | A | Coupling Offset (mm) | 0.05 / 0.3 |
| Plant / Unit | Polymer Plant (OPP) | Bearing Temp (°C) | 80 / 95 |
| Discipline | ROT | NaN | NaN |
| Criticality | High | NaN | NaN |
| Design Life | 5 years (bearing) / 24 months (seal element) | NaN | NaN |
| Monitoring Method | Online DCS + monthly vibration/thermography route | NaN | NaN |
| Linked RCA / AR No. | AR-2026-OPP-0203 | NaN | NaN |
| Failure Date | 17-Jun-2026 | NaN | NaN |
| Dominant Failure Mode | High Vibration (Coupling Misalignment) | NaN | NaN |

## Condition History
| Week | Date | Overall Vibration (mm/s) | 2X Harmonic (mm/s) | Coupling Offset (mm) | Bearing Temp (°C) | Health Status | Remark |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-01-28 | 4.004 | 1.143 | 0.025 | 60.720 | NORMAL | NaN |
| 2 | 2026-02-04 | 4.188 | 1.287 | 0.034 | 59.211 | NORMAL | NaN |
| 3 | 2026-02-11 | 4.091 | 1.293 | 0.037 | 60.730 | NORMAL | NaN |
| 4 | 2026-02-18 | 4.265 | 1.370 | 0.034 | 61.953 | NORMAL | NaN |
| 5 | 2026-02-25 | 4.268 | 1.311 | 0.036 | 60.442 | NORMAL | NaN |
| 6 | 2026-03-04 | 4.435 | 1.470 | 0.051 | 60.923 | ALARM | NaN |
| 7 | 2026-03-11 | 4.443 | 1.694 | 0.054 | 62.389 | ALARM | NaN |
| 8 | 2026-03-18 | 4.892 | 1.646 | 0.054 | 62.862 | ALARM | NaN |
| 9 | 2026-03-25 | 4.581 | 1.763 | 0.069 | 66.274 | ALARM | NaN |
| 10 | 2026-04-01 | 5.295 | 2.022 | 0.085 | 66.864 | ALARM | NaN |
| 11 | 2026-04-08 | 5.636 | 2.195 | 0.092 | 68.063 | ALARM | NaN |
| 12 | 2026-04-15 | 6.003 | 2.247 | 0.125 | 69.333 | ALARM | NaN |
| 13 | 2026-04-22 | 6.667 | 2.605 | 0.122 | 73.118 | ALARM | NaN |
| 14 | 2026-04-29 | 6.786 | 2.871 | 0.143 | 74.414 | ALARM | NaN |
| 15 | 2026-05-06 | 7.425 | 2.960 | 0.163 | 77.137 | ALARM | NaN |
| 16 | 2026-05-13 | 7.976 | 3.206 | 0.183 | 79.822 | ALARM | NaN |
| 17 | 2026-05-20 | 8.582 | 3.579 | 0.197 | 83.580 | ALARM | NaN |
| 18 | 2026-05-27 | 9.120 | 3.951 | 0.222 | 84.866 | ALARM | Degradation trend — under close monitoring |
| 19 | 2026-06-03 | 9.711 | 4.282 | 0.250 | 89.163 | ALARM | Degradation trend — under close monitoring |
| 20 | 2026-06-10 | 10.376 | 4.671 | 0.277 | 92.410 | ALARM | Degradation trend — under close monitoring |
| 21 | 2026-06-17 | 11.220 | 5.100 | 0.306 | 96.900 | TRIP | FAILURE — High Vibration (Coupling Misalignment); unplanned downtime 14.0 h |
| 22 | 2026-06-24 | 3.782 | 1.243 | 0.030 | 60.743 | NORMAL | Post-repair baseline restored (CAPA executed) |
| 23 | 2026-07-01 | 3.760 | 1.255 | 0.023 | 57.352 | NORMAL | NaN |
| 24 | 2026-07-08 | 3.918 | 1.198 | 0.031 | 59.183 | NORMAL | NaN |
| 25 | 2026-07-15 | 3.926 | 1.158 | 0.021 | 60.509 | NORMAL | NaN |
| 26 | 2026-07-22 | 4.001 | 1.155 | 0.001 | 60.783 | NORMAL | NaN |

## Performance Summary
| PERFORMANCE SUMMARY — BL-5702 | Unnamed: 1 | Unnamed: 2 |
| --- | --- | --- |
| NaN | NaN | NaN |
| KPI | Value | Basis / Formula |
| Monitoring Period (weeks) | 26 | Number of weekly readings |
| Total Downtime (hours) | 14 | From linked RCA downtime window |
| Period Hours | 4368 | 4368 |
| Availability (%) | 99.679487 | (Period-Downtime)/Period |
| No. of Failures (period) | 1 | Failure events this period |
| MTBF (hours) | 4368 | Period Hours / No. of Failures |
| MTTR (hours) | 14 | Mean time to repair |
| ALARM readings | 15 | Count of ALARM weeks |
| TRIP readings | 1 | Count of TRIP weeks |
| NORMAL readings | 10 | Count of NORMAL weeks |
| PM Compliance (%) | 92 | PM completed vs scheduled |
| Production Loss (ton) | 532 | Downtime x rate loss (from RCA) |
| Estimated Loss (k USD) | 478.8 | Production loss x product price |
```
