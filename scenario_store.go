package main

import (
	"database/sql"
	"fmt"
)

type ScenarioStore interface {
	Save(scenario *Scenario) error
	Find(id string) (*Scenario, error)
	FindAll() ([]Scenario, error)
	FindAllByUser(user *User) ([]Scenario, error)
	Delete(id string) error
	UpdateConfig(id string, config string) error
}

var globalScenarioStore ScenarioStore

type DBScenarioStore struct {
	db *sql.DB
}

func NewDBScenarioStore() ScenarioStore {
	return &DBScenarioStore{
		db: globalPostgreDB,
	}
}

func (store *DBScenarioStore) Save(scenario *Scenario) error {

	_, err := store.db.Exec(
		`
		INSERT INTO scenarios(id, user_id, name, description, created_at) VALUES($1,$2,$3,$4,$5)
		`,
		scenario.ID, scenario.UserID, scenario.Name, scenario.Description, scenario.CreatedAt,
	)
	return err

}

func (store *DBScenarioStore) Find(id string) (*Scenario, error) {
	fmt.Println(id)

	row := store.db.QueryRow(
		`
		SELECT id, user_id, name,  description, created_at
		FROM scenarios
		WHERE id = $1`,
		id,
	)

	scenario := Scenario{}
	err := row.Scan(
		&scenario.ID,
		&scenario.UserID,
		&scenario.Name,
		&scenario.Description,
		&scenario.CreatedAt,
	)

	fmt.Println(err)
	return &scenario, nil
}

func (store *DBScenarioStore) FindAll() ([]Scenario, error) {
	rows, err := store.db.Query(
		`
		SELECT id, user_id, name, description, created_at
		FROM scenarios
		ORDER BY created_at DESC
		`,
	)
	if err != nil {
		return nil, err
	}

	scenarios := []Scenario{}
	for rows.Next() {
		scenario := Scenario{}
		err := rows.Scan(
			&scenario.ID,
			&scenario.UserID,
			&scenario.Name,
			&scenario.Description,
			&scenario.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		scenarios = append(scenarios, scenario)
	}

	return scenarios, nil
}

func (store *DBScenarioStore) FindAllByUser(user *User) ([]Scenario, error) {
	rows, err := store.db.Query(
		`
		SELECT id, user_id, name, description, created_at
		FROM scenarios
		WHERE user_id = $1
		ORDER BY created_at DESC
		`,
		user.ID,
	)
	if err != nil {
		return nil, err
	}

	scenarios := []Scenario{}
	for rows.Next() {
		scenario := Scenario{}
		err := rows.Scan(
			&scenario.ID,
			&scenario.UserID,
			&scenario.Name,
			&scenario.Description,
			&scenario.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		scenarios = append(scenarios, scenario)
	}

	return scenarios, nil
}

func (store *DBScenarioStore) Delete(id string) error {

	_, err := store.db.Exec(
		`
		delete from scenarios where id=$1
		`,
		id,
	)

	return err
}

func (store *DBScenarioStore) UpdateConfig(id string, config string) error {

	// stmt, err := store.Prepare("update scenarios set config=$1 where id=$2")
	// checkErr(err)

	// res, err := stmt.Exec(config, id)
	// checkErr(err)

	// affect, err := res.RowsAffected()
	// checkErr(err)

	fmt.Println(id)
	fmt.Println(config)

	_, err := store.db.Exec(
		`
		update scenarios set config=$1 where id=$2
		`,
		config, id,
	)
	return err
}
