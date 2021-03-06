package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func init() {

	store, err := NewFileUserStore("./data/users.json")
	if err != nil {
		panic(fmt.Errorf("Error creating user store: %s", err))
	}
	globalUserStore = store

	sessionStore, err := NewFileSessionStore("./data/sessions.json")
	if err != nil {
		panic(fmt.Errorf("Error creating session store: %s", err))
	}
	globalSessionStore = sessionStore

	db, err := NewPostgreDB("user=postgres password=postgre dbname=wppgis sslmode=disable")
	if err != nil {
		panic(err)
	}
	globalPostgreDB = db
	globalScenarioStore = NewDBScenarioStore()
}

func main() {
	router := NewRouter()

	router.Handle("GET", "/", HandleHome)
	router.Handle("GET", "/register", HandleUserNew)
	router.Handle("POST", "/register", HandleUserCreate)
	router.Handle("GET", "/login", HandleSessionNew)
	router.Handle("POST", "/login", HandleSessionCreate)

	router.ServeFiles(
		"/assets/*filepath",
		http.Dir("assets/"),
	)

	secureRouter := NewRouter()

	secureRouter.Handle("GET", "/userID/:userID/scenarioID/:scenarioID/report/:reportProgress", HandleReportGenerate)
	secureRouter.Handle("GET", "/userID/:userID/scenarioID/:scenarioID", HandleScenarioCreate)
	secureRouter.Handle("GET", "/userID/:userID", HandleScenarioList)
	secureRouter.Handle("POST", "/userID/:userID", HandleScenarioShow)
	secureRouter.Handle("POST", "/runmodel", HandleModelRun)
	secureRouter.Handle("POST", "/readmodelresult", HandleModelResultGet)
	secureRouter.Handle("POST", "/comparemodelresult", HandleModelCompare)
	secureRouter.Handle("POST", "/writeconfig", HandleConfigUpdate)
	secureRouter.Handle("POST", "/getlowerupperlimites", HandleOptimizationLimites)
	secureRouter.Handle("POST", "/runoptimizationmodel", HandleOptimizationRun)
	secureRouter.Handle("POST", "/drawecooutletchart", HandleEcoOutletChart)
	secureRouter.Handle("POST", "/drawecooutletcomparechart", HandleEcoOutletCompareChart)
	secureRouter.Handle("POST", "/readoutletecoresult", HandleEcoOutletResultGet)
	secureRouter.Handle("POST", "/getcosteffectiveness", HandleEcoCostEffectiveness)

	// secureRouter.Handle("POST", "/reportgenerator", HandleReportGenerate)

	secureRouter.Handle("POST", "/chart", HandleChart)
	secureRouter.Handle("POST", "/comparechart", HandleCompareChart)

	secureRouter.Handle("POST", "/deletescenario", HandleScenarioDelete)
	secureRouter.Handle("GET", "/sign-out", HandleSessionDestroy)

	middleware := Middleware{}
	middleware.Add(router)
	middleware.Add(http.HandlerFunc(RequireLogin))
	middleware.Add(secureRouter)

	log.Fatal(http.ListenAndServe(":4000", middleware))
}

// Creates a new router
func NewRouter() *httprouter.Router {
	router := httprouter.New()
	router.NotFound = http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	return router
}
