package store

import (
	"database/sql"
	"time"

	_ "github.com/go-sql-driver/mysql"

	"mysso/backend/internal/config"
)

type MySQLStore struct {
	db *sql.DB
}

func OpenMySQL(cfg config.DBConfig) (*sql.DB, error) {
	dsn, err := cfg.DSN()
	if err != nil {
		return nil, err
	}
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)
	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}
	return db, nil
}

func NewMySQLStore(db *sql.DB) *MySQLStore {
	return &MySQLStore{db: db}
}
