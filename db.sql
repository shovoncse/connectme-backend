drop database if exists todo;

create database connectme;
use connectme;


-- Users Table

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (username, email, password)
VALUES
    ('john_doe', 'johndoe@example.com', 'password123'),
    ('jane_doe', 'janedoe@example.com', 'password456'),
    ('admin', 'admin@example.com', 'adminpassword');

-- Posts Table

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO posts (title, body, user_id)
VALUES
    ('My first post', 'This is the body of my first post', 1),
    ('Second post', 'Another post from me', 2),
    ('Third post', 'My third post, not sure what to write', 1);

-- Comments Table

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    body TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    post_id INTEGER NOT NULL REFERENCES posts(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO comments (body, user_id, post_id)
VALUES
    ('Great post!', 2, 1),
    ('I disagree', 1, 1),
    ('Nice one', 2, 2);

-- Likes Table

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    comment_id INTEGER REFERENCES comments(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, post_id, comment_id)
);

INSERT INTO likes (user_id, post_id)
VALUES
    (1, 1),
    (2, 1),
    (1, 2),
    (2, 2);

-- Feedback Table

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    subject VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO feedback (user_id, subject, message)
VALUES
    (1, 'Bug report', 'I found a bug in the login process'),
    (2, 'Feature request', 'Can you add a like button for comments?'),
    (1, 'General feedback', 'I love the site, keep up the good work!');