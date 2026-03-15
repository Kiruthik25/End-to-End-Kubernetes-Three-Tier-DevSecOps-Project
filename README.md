# 🚀 Three-Tier Web Application on AWS EKS

> A production-ready deployment of a **ReactJS + NodeJS + MongoDB** stack on **Kubernetes (EKS)** — with detailed configuration notes for networking, proxying, and environment management.

---

## 🏗️ Architecture Overview

```
Browser
  │
  ▼
Frontend Service (React)
  │
  ▼
Ingress / Service Routing
  │
  ▼
Backend Service (ClusterIP)
  │
  ▼
Backend Pods (Node.js)
  │
  ▼
MongoDB
```

---

## ⚙️ Configuration Details

### 1. 🔌 `kubectl port-forward` with `--address`

By default, `kubectl port-forward` **only binds to `localhost`**, making it inaccessible from outside the machine.

**Default (local only):**
```bash
kubectl port-forward deployment/frontend 3000:3000 -n three-tier
# Accessible at: http://localhost:3000
```

**For remote access (e.g., EC2 instance):**
```bash
kubectl port-forward deployment/frontend 3000:3000 \
  -n three-tier \
  --address 0.0.0.0
# Accessible at: http://<EC2_PUBLIC_IP>:3000
# Example:       http://13.60.52.154:3000
```

**When to use `--address 0.0.0.0`:**
- ✅ Kubernetes runs on a remote machine
- ✅ You need browser access from your local machine
- ✅ Temporary debugging sessions

> ⚠️ **Note:** Port forwarding is intended for **testing/debugging only** — not for production deployments.

---

### 2. ⚛️ React Proxy Configuration

During **development**, React can proxy API requests to the backend automatically.

**Setup in `package.json`:**
```json
{
  "proxy": "http://api:3500"
}
```

**Run the dev server:**
```bash
npm start
```

**Request flow:**
```
Browser → React Dev Server → Proxy → Backend Service

/api/tasks  →  http://api:3500/api/tasks
```

| Mode | Proxy Works? |
|------|-------------|
| `npm start` / `react-scripts start` | ✅ Yes |
| `npm run build` (static files) | ❌ No |
| Docker / Nginx serving build | ❌ No |

> ℹ️ Once React is compiled to static files, the proxy configuration is no longer active.

---

### 3. 🌐 Environment Variable for Backend URL

The frontend reads the backend URL from a build-time environment variable.

**In your React code:**
```javascript
const apiUrl = process.env.REACT_APP_BACKEND_URL;
```

**In your Kubernetes Deployment manifest:**
```yaml
env:
  - name: REACT_APP_BACKEND_URL
    value: "/api/tasks"
```

This routes frontend requests through the same domain:
```
http://localhost:3000/api/tasks
```

**Important — environment variables are applied at build time:**

```dockerfile
RUN npm run build  # Variable is embedded here
```

> ⚠️ Changing the env variable in Kubernetes **after the image is built** has no effect.
>
> To apply changes, you must:
> 1. Rebuild the Docker image
> 2. Push the updated image to your registry
> 3. Redeploy the Kubernetes deployment

---

## 🧩 Recommended Kubernetes Architecture

| Component | Type | Notes |
|-----------|------|-------|
| Frontend | `Deployment` + `Service` | Exposed via Ingress |
| Backend | `Deployment` + `ClusterIP` | Internal-only access |
| MongoDB | `StatefulSet` + `ClusterIP` | Persistent volume recommended |

**Internal communication:**
```
Frontend → http://api:3500/api/tasks
```

The backend is **not exposed externally** — it communicates with the frontend through the Kubernetes internal DNS.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | ReactJS |
| Backend | Node.js |
| Database | MongoDB |
| Container Orchestration | Kubernetes (EKS / kind) |
| Cloud | AWS |

---

## 📌 Quick Reference

```bash
# Port-forward frontend (local)
kubectl port-forward deployment/frontend 3000:3000 -n three-tier

# Port-forward frontend (remote EC2)
kubectl port-forward deployment/frontend 3000:3000 -n three-tier --address 0.0.0.0

# Start React dev server (proxy active)
npm start

# Build for production (proxy inactive, env vars embedded)
npm run build
```

---

*Built with ❤️ using ReactJS · NodeJS · MongoDB · AWS EKS*
