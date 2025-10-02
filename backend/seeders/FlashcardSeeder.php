<?php

/**
 * Flashcard Seeder
 * 
 * Seeds the database with sample flashcard data
 */

return new class {
    public function run(PDO $db): void
    {
        $flashcards = [
            // Programming Concepts
            [
                'front' => 'What is a closure in JavaScript?',
                'back' => 'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.',
                'difficulty' => 'medium'
            ],
            [
                'front' => 'What does REST stand for?',
                'back' => 'REST stands for Representational State Transfer. It is an architectural style for designing networked applications.',
                'difficulty' => 'easy'
            ],
            [
                'front' => 'What is the difference between PUT and PATCH in HTTP?',
                'back' => 'PUT replaces the entire resource, while PATCH applies partial modifications to a resource.',
                'difficulty' => 'medium'
            ],
            [
                'front' => 'What is dependency injection?',
                'back' => 'Dependency injection is a design pattern where dependencies are provided to a class rather than the class creating them itself, promoting loose coupling.',
                'difficulty' => 'hard'
            ],
            
            // Database Concepts
            [
                'front' => 'What is a primary key?',
                'back' => 'A primary key is a unique identifier for a record in a database table. It cannot be NULL and must be unique.',
                'difficulty' => 'easy'
            ],
            [
                'front' => 'What is database normalization?',
                'back' => 'Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.',
                'difficulty' => 'medium'
            ],
            [
                'front' => 'What is the difference between INNER JOIN and LEFT JOIN?',
                'back' => 'INNER JOIN returns only matching rows from both tables, while LEFT JOIN returns all rows from the left table and matching rows from the right table (with NULLs for non-matches).',
                'difficulty' => 'medium'
            ],
            
            // Web Development
            [
                'front' => 'What is CORS?',
                'back' => 'CORS (Cross-Origin Resource Sharing) is a security feature that allows or restricts web applications running at one origin to access resources from a different origin.',
                'difficulty' => 'medium'
            ],
            [
                'front' => 'What is the difference between authentication and authorization?',
                'back' => 'Authentication verifies who you are (identity), while authorization determines what you can access (permissions).',
                'difficulty' => 'easy'
            ],
            [
                'front' => 'What is a JWT?',
                'back' => 'JWT (JSON Web Token) is a compact, URL-safe means of representing claims to be transferred between two parties. It is commonly used for authentication.',
                'difficulty' => 'medium'
            ],
            
            // Docker & DevOps
            [
                'front' => 'What is Docker?',
                'back' => 'Docker is a platform that uses containerization to package applications and their dependencies into portable containers that can run consistently across different environments.',
                'difficulty' => 'easy'
            ],
            [
                'front' => 'What is the difference between a Docker image and a container?',
                'back' => 'An image is a read-only template with instructions for creating a container. A container is a runnable instance of an image.',
                'difficulty' => 'medium'
            ],
            
            // Git & Version Control
            [
                'front' => 'What is the difference between git merge and git rebase?',
                'back' => 'Git merge combines branches by creating a new merge commit, preserving history. Git rebase moves or combines commits to a new base, creating a linear history.',
                'difficulty' => 'hard'
            ],
            [
                'front' => 'What is a git stash?',
                'back' => 'Git stash temporarily saves uncommitted changes so you can work on something else, then reapply them later.',
                'difficulty' => 'easy'
            ],
            
            // Testing
            [
                'front' => 'What is unit testing?',
                'back' => 'Unit testing is the practice of testing individual units or components of code in isolation to ensure they work correctly.',
                'difficulty' => 'easy'
            ],
            [
                'front' => 'What is Test-Driven Development (TDD)?',
                'back' => 'TDD is a development approach where you write tests before writing the actual code, following the Red-Green-Refactor cycle.',
                'difficulty' => 'medium'
            ],
        ];
        
        $stmt = $db->prepare("
            INSERT INTO flashcards (front, back, difficulty, created_at, updated_at)
            VALUES (:front, :back, :difficulty, NOW(), NOW())
        ");
        
        foreach ($flashcards as $flashcard) {
            $stmt->execute($flashcard);
        }
        
        echo "   ✓ Inserted " . count($flashcards) . " flashcards\n";
    }
};
