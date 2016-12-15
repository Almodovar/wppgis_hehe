package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func HandleScenarioList(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
	user, err := globalUserStore.Find(params.ByName("userID"))
	if err != nil {
		panic(err)
	}

	if user == nil {
		http.NotFound(w, r)
		return
	}
	scenarios, err := globalScenarioStore.FindAllByUser(user)
	if err != nil {
		panic(err)
	}
	RenderTemplate(w, r, "scenarios/list", map[string]interface{}{
		"Scenarios": scenarios,
		"User":      user,
	})
}

func HandleScenarioShow(w http.ResponseWriter, r *http.Request, params httprouter.Params) {

	user, err := globalUserStore.Find(params.ByName("userID"))
	if err != nil {
		panic(err)
	}

	if user == nil {
		http.NotFound(w, r)
		return
	}

	scenarios, err := globalScenarioStore.FindAllByUser(user)
	if err != nil {
		panic(err)
	}

	scenario, err := NewScenario(
		params.ByName("userID"),
		r.FormValue("scenarioname"),
		r.FormValue("description"),
		"",
		"",
	)
	if err != nil {
		if IsValidationError(err) {

			RenderTemplate(w, r, "scenarios/list", map[string]interface{}{
				"Error":     err.Error(),
				"Scenarios": scenarios,
				"User":      user,
			})
			return
		}
		panic(err)
		return
	}

	err = globalScenarioStore.Save(&scenario)

	if err != nil {
		panic(err)
		return
	}

	http.Redirect(w, r, "/userID/"+params.ByName("userID")+"/scenarioID/"+scenario.ID, http.StatusFound)
}

func HandleScenarioDelete(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var s Scenario
	err := json.NewDecoder(r.Body).Decode(&s)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	fmt.Println(s.ID)

	err = globalScenarioStore.Delete(s.ID)
	if err != nil {
		panic(err)
	}
	fmt.Fprintln(w, "success")

}

func HandleScenarioCreate(w http.ResponseWriter, r *http.Request, params httprouter.Params) {

	user, err := globalUserStore.Find(params.ByName("userID"))
	if err != nil {
		panic(err)
	}

	if user == nil {
		http.NotFound(w, r)
		return
	}

	fmt.Println(params.ByName("scenarioID"))
	scenario, err := globalScenarioStore.Find(params.ByName("scenarioID"))
	if err != nil {
		panic(err)
	}

	RenderTemplate(w, r, "scenarios/map", map[string]interface{}{
		"Scenario": scenario,
		"User":     user,
	})

}

func HandleConfigUpdate(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var d ScenarioInfo

	err := json.NewDecoder(r.Body).Decode(&d)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Println(d.Config)
	fmt.Println(d.ScenarioID)

	globalScenarioStore.UpdateConfig(d.ScenarioID, d.Config)

	a, err := json.Marshal(d)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.Write(a)

}

type Friend struct {
	Fname string
}

type Person struct {
	UserName string
	Emails   []string
	Friends  []*Friend
}

func HandleReportGenerate(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
	status := params.ByName("reportProgress")
	globalScenarioStore.UpdateStatus(params.ByName("scenarioID"), string(status))

	t := template.New("")
	t, _ = t.ParseFiles("templates/scenarios/report.html")
	scenario, err := globalScenarioStore.Find(params.ByName("scenarioID"))
	if err != nil {
		panic(err)
	}

	globalScenario.UserName = scenario.Name
	globalScenario.ScenarioID = scenario.ID
	globalScenario.State = status

	fmt.Println(scenario)
	fmt.Println(globalScenario)
	t.ExecuteTemplate(w, "report.html", globalScenario)

}

// func HandleScenarioRetrieve(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
// 	var s Scenario
// 	err := json.NewDecoder(r.Body).Decode(&s)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 	}
// 	fmt.Println(s.ID)

// 	err = globalScenarioStore.Delete(s.ID)
// 	if err != nil {
// 		panic(err)
// 	}
// 	fmt.Fprintln(w, "success")

// }
