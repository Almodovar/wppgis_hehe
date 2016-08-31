package main

import "time"

const scenarioIDLength = 15

type Scenario struct {
	ID          string
	UserID      string
	Name        string
	CreatedAt   string
	Description string
	status      string
}

func NewScenario(user_id, scenarioname, description string) (Scenario, error) {

	scenario := Scenario{
		ID:          GenerateID("scenario", scenarioIDLength),
		UserID:      user_id,
		CreatedAt:   time.Now().Format("Mon Jan _2 15:04:05 2006"),
		Name:        scenarioname,
		Description: description,
	}

	if scenarioname == "" {
		return scenario, errNoScenarioname
	}

	return scenario, nil
}
