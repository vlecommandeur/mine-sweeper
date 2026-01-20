import {
  createRouter,
  createRootRoute,
} from '@tanstack/react-router';

// Root route is the index route for now
// As we add more routes (game, auth, etc.), we'll add child routes
const rootRoute = createRootRoute({
  component: function Index() {
    return (
      <div>
        <h1>Welcome to Mine Sweeper</h1>
        <p>Select a difficulty to start playing</p>
      </div>
    );
  },
});

// Create the router instance
const router = createRouter({
  routeTree: rootRoute,
});

export default router;
