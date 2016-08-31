package main

/******************************************************
					IMPORT TEMPLATE
*******************************************************/
import (
	"database/sql"

	_ "github.com/lib/pq"
)

var globalPostgreDB *sql.DB

func NewPostgreDB(dsn string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	return db, db.Ping()
}
