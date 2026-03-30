package mysql

import (
	"database/sql"
	"time"

	_ "github.com/go-sql-driver/mysql"

	"mysso/backend/internal/config"
	"mysso/backend/internal/store"
)

type CleanupPlan = store.CleanupPlan

var (
	ErrNotFound                         = store.ErrNotFound
	ErrAuthorizationCodeUnavailable     = store.ErrAuthorizationCodeUnavailable
	ErrAuthorizationCodeRequestMismatch = store.ErrAuthorizationCodeRequestMismatch
	ErrAuthorizationCodePKCEMismatch    = store.ErrAuthorizationCodePKCEMismatch
	ErrRefreshTokenClientMismatch       = store.ErrRefreshTokenClientMismatch
	ErrRefreshTokenRevoked              = store.ErrRefreshTokenRevoked
	ErrRefreshTokenReuseDetected        = store.ErrRefreshTokenReuseDetected
	ErrRefreshTokenExpired              = store.ErrRefreshTokenExpired
)

type MySQLStore struct {
	db *sql.DB
}

var _ store.Store = (*MySQLStore)(nil)

func Open(cfg config.DBConfig) (*sql.DB, error) {
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

func NewStore(db *sql.DB) *MySQLStore {
	return &MySQLStore{db: db}
}
