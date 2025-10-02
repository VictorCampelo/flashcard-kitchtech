<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Environment;

/**
 * Base Controller
 * 
 * Provides common functionality for all controllers
 */
abstract class BaseController
{
    /**
     * Send JSON success response
     */
    protected function sendSuccess(mixed $data, int $code = 200, ?string $message = null): void
    {
        http_response_code($code);
        
        $response = ['success' => true];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        if (is_array($data) && isset($data['data'])) {
            $response = array_merge($response, $data);
        } else {
            $response['data'] = $data;
        }
        
        echo json_encode($response);
        exit;
    }
    
    /**
     * Send JSON error response
     */
    protected function sendError(string $message, int $code = 500, ?\Exception $e = null): void
    {
        http_response_code($code);
        
        $response = [
            'success' => false,
            'error' => $message
        ];
        
        // Add exception details in debug mode
        if ($e && Environment::isDebug()) {
            $response['debug'] = [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ];
        }
        
        echo json_encode($response);
        exit;
    }
    
    /**
     * Send validation error response
     */
    protected function sendValidationError(array $errors): void
    {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'error' => 'Validation failed',
            'errors' => $errors
        ]);
        exit;
    }
    
    /**
     * Get request body as array
     */
    protected function getRequestBody(): array
    {
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->sendError('Invalid JSON payload', 400);
        }
        
        return $data ?? [];
    }
    
    /**
     * Validate ID parameter
     */
    protected function validateId(string $id): int
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            $this->sendError('Invalid ID parameter', 400);
        }
        
        return (int) $id;
    }
}
