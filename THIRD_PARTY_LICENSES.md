# BlockPay Nexus — Third-Party Open Source Licenses & Attributions

BlockPay Nexus is built exclusively on free and open-source software (FOSS). No proprietary or paid dependencies, subscription kits, or commercial UI templates are used in this project.

All core dependencies utilize permissive open-source licenses (MIT, Apache 2.0, BSD, ISC).

---

## 1. Primary Frontend Foundation Attribution

BlockPay Nexus uses the free/open-source **Shadcn Dashboard** template as its primary UI design foundation:

```text
MIT License

Copyright (c) 2026 Shadcn Dashboard (https://github.com/shadcndashboard/shadcndashboard)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2. Frontend Libraries & Frameworks

| Package | Purpose | License | Source / Upstream |
| :--- | :--- | :--- | :--- |
| **React** | Reactive UI framework | MIT | Facebook / Meta Open Source |
| **Vite** | Frontend build tool & bundler | MIT | Evan You / Vite Contributors |
| **Tailwind CSS** | Utility-first CSS framework | MIT | Tailwind Labs |
| **Lucide React** | Scalable vector icons | ISC | Lucide Project |
| **Recharts** | Declarative charting library | MIT | Recharts Group |
| **clsx / tailwind-merge** | Class name merging utilities | MIT | Luke Edwards / Dany Castillo |

---

## 3. Backend & Microservices Stack

| Package | Purpose | License | Source / Upstream |
| :--- | :--- | :--- | :--- |
| **Python** | Core runtime environment | PSF | Python Software Foundation |
| **FastAPI** | High-performance ASGI REST framework | MIT | Sebastián Ramírez (tiangolo) |
| **Uvicorn** | Lightning-fast ASGI server | BSD-3-Clause | Encode OSS |
| **Pydantic** | Data validation & type enforcement | MIT | Samuel Colvin / Pydantic Services Inc |
| **Pytest** | Testing framework | MIT | Holger Krekel & Pytest Developers |
| **PyTorch** | Deep learning / legacy anomaly models | BSD-3-Clause | Linux Foundation / Meta AI |
| **Torchvision** | Computer vision transformations | BSD-3-Clause | PyTorch Team |

---

## 4. Blockchain & Database Infrastructure

| Component | Purpose | License | Source / Upstream |
| :--- | :--- | :--- | :--- |
| **Solidity** | Smart contract language for EVM | GPL-3.0 / Apache 2.0 | Ethereum Foundation |
| **OpenZeppelin Contracts** | Secure smart contract primitives | MIT | OpenZeppelin |
| **PostgreSQL** | Relational transactional database | PostgreSQL License (MIT-like) | PostgreSQL Global Development Group |
| **Redis** | In-memory cache & rate limiter | BSD-3-Clause / RSAL | Redis Ltd / Linux Foundation |
| **RabbitMQ** | AMQP event message broker | MPL-2.0 | VMware / Broadcom Inc |

---

## 5. Compliance Invariant

This project is strictly compliant with the **Free-Only Requirement**:
- Zero paid API subscriptions are mandated.
- Zero commercial UI component kits or CSS frameworks are included.
- Zero proprietary closed-source SDKs or telemetry trackers are utilized.
- All code is redistributable under academic and open-source terms.
