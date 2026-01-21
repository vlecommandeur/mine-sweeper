import { createRouter, createRootRoute } from "@tanstack/react-router";
import { GameHUD } from "../components/game/GameHUD";
import { GameBoard } from "../components/game/GameBoard";

// Root route is the index route for now
// As we add more routes (game, auth, etc.), we'll add child routes
const rootRoute = createRootRoute({
  component: function Index() {
    return (
      <div className="flex flex-col justify-center items-center">
        <GameHUD />
        <GameBoard />
      </div>
    );
  },
});

// Create the router instance
const router = createRouter({
  routeTree: rootRoute,
});

export default router;
