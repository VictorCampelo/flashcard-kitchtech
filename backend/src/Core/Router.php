<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Simple Router for API endpoints
 * 
 * Handles HTTP routing with dynamic parameters
 */
class Router
{
    private array $routes = [];
    
    /**
     * Register GET route
     */
    public function get(string $path, string $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }
    
    /**
     * Register POST route
     */
    public function post(string $path, string $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }
    
    /**
     * Register PUT route
     */
    public function put(string $path, string $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }
    
    /**
     * Register DELETE route
     */
    public function delete(string $path, string $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }
    
    /**
     * Register RESTful resource routes (shortcut for CRUD)
     * 
     * @param string $path Base path (e.g., '/api/flashcards')
     * @param string $controller Controller class (e.g., 'App\Controllers\FlashcardController')
     */
    public function resource(string $path, string $controller): void
    {
        $this->get($path, "{$controller}@index");              // GET /api/flashcards
        $this->get("{$path}/{id}", "{$controller}@show");      // GET /api/flashcards/{id}
        $this->post($path, "{$controller}@store");             // POST /api/flashcards
        $this->put("{$path}/{id}", "{$controller}@update");    // PUT /api/flashcards/{id}
        $this->delete("{$path}/{id}", "{$controller}@destroy"); // DELETE /api/flashcards/{id}
    }
    
    /**
     * Add route to registry
     */
    private function addRoute(string $method, string $path, string $handler): void
    {
        // Convert route pattern to regex (e.g., /api/flashcards/{id} -> /api/flashcards/(\d+))
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([^/]+)', $path);
        $pattern = '#^' . $pattern . '$#';
        
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'path' => $path,
            'handler' => $handler
        ];
    }
    
    /**
     * Dispatch current request to appropriate handler
     */
    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            
            if (preg_match($route['pattern'], $uri, $matches)) {
                // Remove full match from matches array
                array_shift($matches);
                
                // Extract controller and method from handler string
                [$controller, $method] = explode('@', $route['handler']);
                
                // Instantiate controller and call method
                if (class_exists($controller)) {
                    $controllerInstance = new $controller();
                    
                    if (method_exists($controllerInstance, $method)) {
                        // Call controller method with captured parameters
                        call_user_func_array([$controllerInstance, $method], $matches);
                        return;
                    }
                }
            }
        }
        
        // No route found
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Not Found',
            'message' => 'The requested endpoint does not exist'
        ]);
    }
}
