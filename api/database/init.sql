PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS User (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pseudo TEXT,
    email TEXT UNIQUE,
    password TEXT
);
CREATE TABLE IF NOT EXISTS Horse (
    horse_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
);
CREATE TABLE IF NOT EXISTS Room (
    room_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TINYINT,
    code INTEGER,
    max_nb_players TINYINT,
    admin_id INTEGER,
    FOREIGN KEY(admin_id) REFERENCES User(user_id)
);
CREATE TABLE IF NOT EXISTS Round (
    round_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TINYINT,
    duration TINYINT,
    room_id INTEGER,
    FOREIGN KEY(room_id) REFERENCES Room(room_id)
);
CREATE TABLE IF NOT EXISTS Message (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    sending_date DATETIME,
    room_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY(room_id) REFERENCES Room(room_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id)
);
CREATE TABLE IF NOT EXISTS User_Room (
    user_id INTEGER,
    room_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES User(user_id),
    FOREIGN KEY(room_id) REFERENCES Room(room_id)
);
CREATE TABLE IF NOT EXISTS Bet (
    sips_number INTEGER,
    horse_id INTEGER,
    user_id INTEGER,
    round_id INTEGER,
    FOREIGN KEY(horse_id) REFERENCES Horse(horse_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id),
    FOREIGN KEY(round_id) REFERENCES Round(round_id),
    PRIMARY KEY(user_id, round_id)
);
INSERT INTO Horse (name)
VALUES ("Roger");
INSERT INTO Horse (name)
VALUES ("Gerard");
INSERT INTO Horse (name)
VALUES ("Jean Jacques");
INSERT INTO Horse (name)
VALUES ("Marcel");
