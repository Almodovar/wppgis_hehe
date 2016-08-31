package main

import "database/sql"

type ScenarioStore interface {
	Save(scenario *Scenario) error
	Find(id string) (*Scenario, error)
	FindAll() ([]Scenario, error)
	FindAllByUser(user *User) ([]Scenario, error)
	Delete(id string) error
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
	row := store.db.QueryRow(
		`
		SELECT id, user_id, name, location, description, size, created_at
		FROM scenarios
		WHERE id = ?`,
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
	return &scenario, err
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
