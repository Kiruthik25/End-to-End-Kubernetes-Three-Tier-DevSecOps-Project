
Welcome to the Three-Tier Web Application Deployment project! 🚀

This repository hosts the implementation of a Three-Tier Web App using ReactJS, NodeJS, and MongoDB, deployed on AWS EKS. The project covers a wide range of tools and practices for a robust and scalable DevOps setup.

his project uses Kubernetes (kind) with a React frontend and Node.js backend.
The following configuration changes were made to ensure proper communication between the frontend and backend services.

1. Using --address with kubectl port-forward

By default, kubectl port-forward only binds to localhost.

Example:

kubectl port-forward deployment/frontend 3000:3000 -n three-tier

This allows access only from the same machine:

http://localhost:3000

When the Kubernetes cluster runs on a remote server (e.g., EC2), external access is required.

Use:

kubectl port-forward deployment/frontend 3000:3000 \
-n three-tier \
--address 0.0.0.0

Now the application can be accessed using:

http://<EC2_PUBLIC_IP>:3000

Example:

http://13.60.52.154:3000
When to Use --address

Use it when:

Kubernetes runs on a remote machine

You want to access the application from your local browser

You are performing temporary debugging

⚠️ Port forwarding is meant for testing/debugging, not production deployments.

2. React Proxy Configuration

During development, React can proxy API calls to the backend.

Add this in package.json:

"proxy": "http://api:3500"

Then run:

npm start
Request Flow
Browser → React Dev Server → Proxy → Backend Service

Example API request:

/api/tasks

becomes

http://api:3500/api/tasks
When Proxy Works

Proxy works only when running:

npm start

or

react-scripts start

This means the React development server is active.

When Proxy Does NOT Work

Proxy does not work in production builds.

Example production setups:

Docker container

Nginx serving static files

npm run build

When React is compiled:

npm run build

the application becomes static files, and the proxy feature is no longer available.

3. Environment Variable for Backend URL

The frontend reads the backend URL from an environment variable.

Example React code:

const apiUrl = process.env.REACT_APP_BACKEND_URL

In Kubernetes Deployment:

env:
  - name: REACT_APP_BACKEND_URL
    value: "/api/tasks"

This allows the frontend to call the backend through the same domain.

Example request:

http://localhost:3000/api/tasks
When Environment Variables Work

Environment variables are applied during build time.

Example Dockerfile step:

RUN npm run build

The variable value is embedded into the built React files.

When Environment Variables Do Not Change Behavior

If the container image was already built, changing the environment variable in Kubernetes will not update the React application.

In that case you must:

Rebuild the Docker image

Push the updated image

Redeploy the Kubernetes deployment

Recommended Kubernetes Architecture
Browser
   ↓
Frontend Service
   ↓
Ingress / Service Routing
   ↓
Backend Service (ClusterIP)
   ↓
Backend Pods

Backend should be exposed internally using:

ClusterIP

Frontend communicates with backend using:

/api/tasks

or

http://api:3500

within the Kubernetes cluster.
