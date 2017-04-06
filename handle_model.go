package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"

	"github.com/julienschmidt/httprouter"
	_ "github.com/mattn/go-sqlite3"
	"github.com/montanaflynn/stats"
)

type ScenarioInfo struct {
	ScenarioID     string
	UserName       string
	ScenarioName   string
	ScenarioGet    string
	Config         string
	State          string
	BMPFeatureType string
	BMPConfig      []BMPAssignment
}

type BMPAssignment struct {
	FeatureID int
	CC        string
	CT        string
	NM        string
	Wascobs   string
}

var globalScenario = new(ScenarioInfo)

type BMPCodeFeature struct {
	FeatureID   int
	BMPCode     int
	FeatureType string
	Wascob      string
	// Config      string
}

type BMPCodeHRU struct {
	HRUID   int
	BMPCode int
}

type BMPCode struct {
	FeatureID int
	BMPCode   int
}

type Properties struct {
	Name string `json:"name"`
}

type Crs struct {
	Type       string      `json:"type"`
	Properties *Properties `json:"properties"`
}

type FeatureProperties struct {
	Name           string  `json:"name"`
	Description    string  `json:"description"`
	Sediment       float64 `json:"sediment"`
	Flow           float64 `json:"flow"`
	Tp             float64 `json:"tp"`
	Tn             float64 `json:"tn"`
	SedimentLevel  string  `json:"sedimentlevel"`
	FlowLevel      string  `json:"flowlevel"`
	TpLevel        string  `json:"tplevel"`
	TnLevel        string  `json:"tnlevel"`
	OptBMPs        string
	Cost           float64 `json:"cost"`
	Revenue        float64 `json:"revenue"`
	NetReturn      float64 `json:"netreturn"`
	CostLevel      string  `json:"costlevel"`
	RevenueLevel   string  `json:"revenuelevel"`
	NetReturnLevel string  `json:"netreturnlevel"`
}

type Geometry struct {
	Type        string      `json:"type"`
	Coordinates interface{} `json:"coordinates"`
}

type Feature struct {
	Type       string             `json:"type"`
	Properties *FeatureProperties `json:"properties"`
	Geometry   *Geometry          `json:"geometry"`
}

type MapFeature struct {
	Type     string    `json:"type"`
	Crs      *Crs      `json:"crs"`
	Features []Feature `json:"features"`
}

type Result struct {
	Water    float64
	Sediment float64
	Tp       float64
	Tn       float64
}

type EcoResult struct {
	Cost      float64
	Revenue   float64
	NetReturn float64
}

var SedimentQuartile []float64
var FlowQuartile []float64
var TpQuartile []float64
var TnQuartile []float64
var CostFieldQuartile []float64
var RevenueFieldQuartile []float64

var NetReturnFieldQuartile []float64
var CostSubbasinQuartile []float64
var RevenueSubbasinQuartile []float64
var NetReturnSubbasinQuartile []float64

var subbasinArray map[int]map[int]Result

var fieldArray map[int]map[int]*Result

var compareTosubbasinArray map[int]map[int]Result

var compareTofieldArray map[int]map[int]*Result

var compareFromsubbasinArray map[int]map[int]Result

var compareFromfieldArray map[int]map[int]*Result

var subbasinArea = make(map[int]float64)

var fieldArea = make(map[int]float64)

var subbasinAverage map[int]*Result

var fieldAverage map[int]*Result

var compareTosubbasinAverage = make(map[int]*Result)

var compareTofieldAverage = make(map[int]*Result)

var compareFromsubbasinAverage = make(map[int]*Result)

var compareFromfieldAverage = make(map[int]*Result)

type OutletResultTypeArray struct {
	ResultType string
	ResultData []float64
}

var outletArray []*OutletResultTypeArray
var outletCompareArray []*OutletResultTypeArray

// =============================================================================
var fieldIDArray = make(map[int]float64)
var subbasinIDArray = make(map[int]float64)

var fieldEcoResult = make(map[int]map[int]*EcoResult)
var subbasinEcoResult = make(map[int]map[int]*EcoResult)
var fieldEcoAverageResult = make(map[int]*EcoResult)
var subbasinEcoAverageResult = make(map[int]*EcoResult)

var fieldCompareEcoResult = make(map[int]map[int]*EcoResult)
var subbasinCompareEcoResult = make(map[int]map[int]*EcoResult)
var fieldCompareEcoAverageResult = make(map[int]*EcoResult)
var subbasinCompareEcoAverageResult = make(map[int]*EcoResult)

var fieldInSubbasin = make(map[int]map[int]float64)
var subbasinInField = make(map[int]map[int]float64)

// ==============================================================================

func HandleModelRun(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	initFeatureArray()
	fieldEcoResult, subbasinEcoResult = initEcoData("yield_historic")

	for w, _ := range fieldEcoResult[84] {
		fmt.Println(w, fieldEcoResult[84][w])
	}

	initConvertTable()

	var err error
	var d []BMPCodeFeature

	var x []BMPCodeHRU
	var BMPCodeArray [518]int
	var BMPWascobArray = make([]string, 32)
	var BMPCodeHRUString string
	var BMPConfig []BMPAssignment

	for i := 0; i < 32; i++ {
		BMPWascobArray[i] = "0"
	}

	for i := 0; i < len(BMPCodeArray); i++ {
		BMPCodeArray[i] = 1
	}

	err = json.NewDecoder(r.Body).Decode(&d)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	// globalScenarioStore.UpdateConfig(d[0].Config, )

	if d[0].FeatureType == "field" {
		var effectedSubbasinIDs = []int{}
		for _, i := range d {
			fmt.Println(i.FeatureID)
			updateEconomicByFieldID(i.FeatureID, i.BMPCode)
			for m, _ := range subbasinInField {
				if m == i.FeatureID {
					for j, _ := range subbasinInField[m] {
						effectedSubbasinIDs = append(effectedSubbasinIDs, j)
					}
				}
			}
		}
		// fmt.Println(effectedSubbasinIDs)
		for s := 0; s < len(effectedSubbasinIDs); s++ {
			subbasinEcoResult[s] = subbasinEcoResultFromField(s)
		}
	}

	if d[0].FeatureType == "subbasin" {
		var effectedFieldIDs = []int{}
		for _, i := range d {
			updateEconomicBySubbasinID(i.FeatureID, i.BMPCode)

			for m, _ := range fieldInSubbasin {
				if m == i.FeatureID {
					for j, _ := range fieldInSubbasin[m] {
						effectedFieldIDs = append(effectedFieldIDs, j)
					}
				}
			}
		}

		for s := 0; s < len(effectedFieldIDs); s++ {
			fieldEcoResult[s] = fieldEcoResultFromSubbasin(s)
		}
	}

	for w, _ := range fieldEcoResult[84] {
		fmt.Println(w, fieldEcoResult[84][w])
	}

	fieldEcoAverageResult = initFieldAverageEcoResultArray(fieldEcoResult)
	subbasinEcoAverageResult = initSubbasinAverageEcoResultArray(subbasinEcoResult)

	fmt.Println(w, fieldEcoAverageResult[84].Cost)

	dbSpatial, err := sql.Open("sqlite3", "./assets/swat/spatial.db3")
	checkErr(err)

	for _, i := range d {
		var id = i.FeatureID
		var bmpCode = i.BMPCode

		var b = new(BMPAssignment)
		b.FeatureID = id
		b.CC = "N"
		b.CT = "N"
		b.NM = "N"
		b.Wascobs = "N"
		if bmpCode == 9 {
			b.CC = "Y"
			b.CT = "Y"
			b.NM = "Y"
			if i.Wascob == string('Y') {
				b.Wascobs = "Y"
			}
		}

		BMPConfig = append(BMPConfig, *b)
	}

	globalScenario.BMPConfig = BMPConfig
	globalScenario.BMPFeatureType = d[0].FeatureType

	for _, bmp := range BMPConfig {
		fmt.Println(bmp)
	}
	fmt.Println(globalScenario.BMPFeatureType)

	if d[0].FeatureType == "field" {
		for _, i := range d {
			var id = i.FeatureID

			rows, err := dbSpatial.Query("SELECT subbasin, field FROM field_subbasin")
			checkErr(err)

			for rows.Next() {
				var fieldID int
				var subbasinID int
				err = rows.Scan(&subbasinID, &fieldID)
				checkErr(err)

				if fieldID == id {
					var x = new(BMPCodeFeature)
					x.BMPCode = i.BMPCode
					x.FeatureID = subbasinID
					x.FeatureType = "subbasin"
					d = append(d, *x)
				}
			}
		}

		var s = make(map[int]int)

		for _, x := range d {
			if x.FeatureType == "subbasin" {
				var flag = false
				if _, ok := s[x.FeatureID]; ok {
					if x.BMPCode > s[x.FeatureID] {
						s[x.FeatureID] = x.BMPCode
					}
					flag = true
				}
				if !flag {
					s[x.FeatureID] = x.BMPCode
				}
			}

		}
		// fmt.Println(s)
	}

	// fmt.Println(d)

	for _, i := range d {
		var id = i.FeatureID
		var bmpCode = i.BMPCode

		rows, err := dbSpatial.Query("SELECT subbasin, HRUSWATIndex FROM hru_subbasin")
		checkErr(err)

		for rows.Next() {
			var subbasinID int
			var hruID int
			err = rows.Scan(&subbasinID, &hruID)
			checkErr(err)

			if subbasinID == id && i.FeatureType == "subbasin" {
				var a BMPCodeHRU
				a.BMPCode = bmpCode
				a.HRUID = hruID
				x = append(x, a)
				BMPCodeArray[hruID-1] = bmpCode
			}
		}
	}

	for _, i := range d {
		var id = i.FeatureID
		var featureType = i.FeatureType
		var wascob = i.Wascob

		rows, err := dbSpatial.Query("SELECT ID, FIELD, SUBBASIN FROM wascobs_field_subbasin")
		checkErr(err)

		for rows.Next() {
			var subbasinID int
			var fieldID int
			var wascobID int
			err = rows.Scan(&wascobID, &fieldID, &subbasinID)
			checkErr(err)

			if featureType == "subbasin" {
				if id == subbasinID && wascob == string('Y') {
					BMPWascobArray[wascobID-1] = "1"
				}
			}
			if featureType == "field" && wascob == string('Y') {
				if id == fieldID {
					BMPWascobArray[wascobID-1] = "1"
				}
			}
		}
	}

	var wascobString = strings.Join(BMPWascobArray, " ")

	fmt.Println(wascobString)

	dbSpatial.Close()

	websString := "Input file generated by WEBsInterface, University of Guelph \r\n" +
		"518    | Total HRU number \r\n" +
		"32   | Total WASCoB number \r\n" +
		"Scenario Database \r\n" +
		"C:\\xxKun_Learn\\Go\\Go\\src\\wppgis\\assets\\swat\\RESULT\\test.db3 \r\n" +
		"Scenario type (1: historic; 2: conventional; 3: user define) \r\n" +
		"3 \r\n" +
		"WASCoBs (RES file code for all WASCoBs. Only operating in user define scenario. 0: without WASCoB; 1: with WASCoB) \r\n" +
		wascobString + "\r\n" +
		"Scenario input (MGT file code for all HRUs. Only operating in user define scenario.1: historic; 2: conventional; 3: conservation tillage; 4: NMAN; 5: cover crop; 6: conservation tillage + NMAN; 7: conservation tillage + cover crop; 8: NMAN + cover crop; 9: conservation tillage + NMAN + cover crop)\r\n "

	for i := 0; i < len(BMPCodeArray); i++ {
		BMPCodeHRUString = BMPCodeHRUString + strconv.Itoa(BMPCodeArray[i]) + " "
	}
	websString = websString + BMPCodeHRUString

	f, err := os.Create("./assets/swat/webs.webs")
	checkErr(err)

	defer f.Close()

	fmt.Println(websString)

	err = ioutil.WriteFile("./assets/swat/webs2.webs", []byte(websString), 0644)
	if err != nil {
		panic(err)
	}
	_, err = f.WriteString(websString)
	checkErr(err)

	done := make(chan bool, 1)
	go func() {

		cmd := exec.Command("SWAT_abca_150524")
		cmd.Dir = "C:/xxKun_Learn/Go/Go/src/wppgis/assets/swat"
		cmd.Run()
		done <- true

	}()

	fmt.Println("awaiting")

	<-done
	fmt.Println("done")

	BasintoField("result")
	// AssignEcoResult()
	GenerateResultJsonFile("field", "fieldoutput", fieldAverage, fieldEcoAverageResult, subbasinEcoAverageResult)
	GenerateResultJsonFile("basin", "basinoutput", subbasinAverage, fieldEcoAverageResult, subbasinEcoAverageResult)
	OutletResultArray("result")

	fmt.Println(fieldEcoAverageResult[84].Cost)

	compareTosubbasinArray = subbasinArray
	compareTosubbasinAverage = subbasinAverage
	compareTofieldArray = fieldArray
	compareTofieldAverage = fieldAverage

	// fmt.Println(compareTosubbasinArray[61])

	a, err := json.Marshal(outletArray)
	w.Write(a)
}

func HandleModelResultGet(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var scenario = new(ScenarioInfo)
	err := json.NewDecoder(r.Body).Decode(&scenario)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	// fmt.Println("1", fieldEcoAverageResult[84].Cost)

	// fmt.Println(scenario)
	if strings.TrimSpace(scenario.ScenarioGet) == "conventional" {
		fieldCompareEcoResult, subbasinCompareEcoResult = initEcoData("yield_conventional")
	}
	if strings.TrimSpace(scenario.ScenarioGet) == "historical" {
		fieldCompareEcoResult, subbasinCompareEcoResult = initEcoData("yield_historic")
	}

	// fmt.Println("2", fieldEcoAverageResult[84].Cost)

	fieldCompareEcoAverageResult = initFieldAverageEcoResultArray(fieldCompareEcoResult)
	subbasinCompareEcoAverageResult = initSubbasinAverageEcoResultArray(subbasinCompareEcoResult)

	// fmt.Println("3", fieldEcoAverageResult[84].Cost)

	BasintoField(strings.TrimSpace(scenario.ScenarioGet))
	GenerateResultJsonFile("field", "fieldcompare", fieldAverage, fieldCompareEcoAverageResult, subbasinCompareEcoAverageResult)
	GenerateResultJsonFile("basin", "basincompare", subbasinAverage, fieldCompareEcoAverageResult, subbasinCompareEcoAverageResult)
	OutletResultArray(strings.TrimSpace(scenario.ScenarioGet))

	// fmt.Println(fieldCompareEcoAverageResult[84].Cost)
	// fmt.Println(fieldEcoAverageResult[84].Cost)

	compareFromsubbasinArray = subbasinArray
	compareFromsubbasinAverage = subbasinAverage
	compareFromfieldArray = fieldArray
	compareFromfieldAverage = fieldAverage

	// fmt.Println(compareFromsubbasinArray[61])

	a, err := json.Marshal(outletArray)
	w.Write(a)
}

func HandleEcoOutletResultGet(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var scenario = new(ScenarioInfo)
	err := json.NewDecoder(r.Body).Decode(&scenario)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	var outletEcoResult []float64
	// fmt.Println(scenario)

	fieldEcoResult := make(map[int]map[int]*EcoResult)

	if strings.TrimSpace(scenario.ScenarioGet) == "conventional" {
		fieldEcoResult, _ = initEcoData("yield_conventional")
	}
	if strings.TrimSpace(scenario.ScenarioGet) == "historical" {
		fieldEcoResult, _ = initEcoData("yield_historic")
	}

	fieldEcoAverageResult := initFieldAverageEcoResultArray(fieldEcoResult)

	var costSum float64
	var revenueSum float64
	var netreturnSum float64
	if strings.TrimSpace(scenario.ScenarioGet) == "conventional" {
		for i, _ := range fieldEcoAverageResult {
			costSum += fieldEcoAverageResult[i].Cost
			revenueSum += fieldEcoAverageResult[i].Revenue
			netreturnSum += fieldEcoAverageResult[i].NetReturn
		}
	}
	if strings.TrimSpace(scenario.ScenarioGet) == "historical" {
		for i, _ := range fieldEcoAverageResult {
			costSum += fieldEcoAverageResult[i].Cost
			revenueSum += fieldEcoAverageResult[i].Revenue
			netreturnSum += fieldEcoAverageResult[i].NetReturn
		}
	}

	outletEcoResult = append(outletEcoResult, costSum)
	outletEcoResult = append(outletEcoResult, revenueSum)
	outletEcoResult = append(outletEcoResult, netreturnSum)

	fmt.Println(outletEcoResult)

	a, err := json.Marshal(outletEcoResult)
	w.Write(a)
}

type FeatureResultType struct {
	ID         int
	Type       string
	ResultType string
}

func HandleChart(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var d FeatureResultType
	err := json.NewDecoder(r.Body).Decode(&d)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	var arrayDataFeatureResultType []float64
	if d.Type == "subbasin" {
		if d.ResultType == "flow" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, subbasinArray[d.ID][i].Water)
			}
		}
		if d.ResultType == "sediment" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, subbasinArray[d.ID][i].Sediment)
			}
		}

		if d.ResultType == "tp" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, subbasinArray[d.ID][i].Tp)
			}
		}
		if d.ResultType == "tn" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, subbasinArray[d.ID][i].Tn)
			}
		}
		if d.ResultType == "cost" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, subbasinEcoResult[d.ID][i].Cost)
			}
		}
		if d.ResultType == "revenue" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, subbasinEcoResult[d.ID][i].Revenue)
			}
		}
		if d.ResultType == "netreturn" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, subbasinEcoResult[d.ID][i].NetReturn)
			}
		}
	}

	if d.Type == "field" {
		if d.ResultType == "flow" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, fieldArray[d.ID][i].Water)
			}
		}
		if d.ResultType == "sediment" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, fieldArray[d.ID][i].Sediment)
			}
		}

		if d.ResultType == "tp" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, fieldArray[d.ID][i].Tp)
			}
		}
		if d.ResultType == "tn" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, fieldArray[d.ID][i].Tn)
			}
		}

		if d.ResultType == "cost" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, fieldEcoResult[d.ID][i].Cost)
			}
		}
		if d.ResultType == "revenue" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, fieldEcoResult[d.ID][i].Revenue)
			}
		}
		if d.ResultType == "netreturn" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, fieldEcoResult[d.ID][i].NetReturn)
			}
		}
	}

	a, err := json.Marshal(arrayDataFeatureResultType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.Write(a)
}

func HandleEcoOutletChart(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var d string
	err := json.NewDecoder(r.Body).Decode(&d)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	var result = []float64{}
	var sumByYear = make(map[int]float64)

	if d == "cost" {
		for i := range fieldEcoResult {
			for j := range fieldEcoResult[i] {
				sumByYear[j] += fieldEcoResult[i][j].Cost
			}
		}
	}
	if d == "revenue" {
		for i := range fieldEcoResult {
			for j := range fieldEcoResult[i] {
				sumByYear[j] += fieldEcoResult[i][j].Revenue
			}
		}
	}
	if d == "netreturn" {
		for i := range fieldEcoResult {
			for j := range fieldEcoResult[i] {
				sumByYear[j] += fieldEcoResult[i][j].NetReturn
			}
		}
	}

	for y := 2002; y <= 2011; y++ {
		result = append(result, sumByYear[y])
	}
	a, err := json.Marshal(result)
	w.Write(a)
}

func HandleCompareChart(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var d FeatureResultType
	err := json.NewDecoder(r.Body).Decode(&d)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	// fmt.Println(d.ID)
	// fmt.Println(d.Type)
	// fmt.Println(d.ResultType)
	// fmt.Println(compareTosubbasinArray[61])
	// fmt.Println(compareFromsubbasinArray[61])

	var arrayDataFeatureResultType []float64
	if d.Type == "subbasin" {
		if d.ResultType == "flow" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, (compareTosubbasinArray[d.ID][i].Water-compareFromsubbasinArray[d.ID][i].Water)*100/compareFromsubbasinArray[d.ID][i].Water)
			}
		}
		if d.ResultType == "sediment" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, (compareTosubbasinArray[d.ID][i].Sediment-compareFromsubbasinArray[d.ID][i].Sediment)*100/compareFromsubbasinArray[d.ID][i].Sediment)
				// fmt.Println(compareTosubbasinArray[d.ID][i].Sediment)
				// fmt.Println(compareFromsubbasinArray[d.ID][i].Sediment)
			}
		}

		if d.ResultType == "tp" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, (compareTosubbasinArray[d.ID][i].Tp-compareFromsubbasinArray[d.ID][i].Tp)*100/compareFromsubbasinArray[d.ID][i].Tp)
			}
		}
		if d.ResultType == "tn" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, (compareTosubbasinArray[d.ID][i].Tn-compareFromsubbasinArray[d.ID][i].Tn)*100/compareFromsubbasinArray[d.ID][i].Tn)
			}
		}
	}

	if d.Type == "field" {
		if d.ResultType == "flow" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, (compareTofieldArray[d.ID][i].Water-compareFromfieldArray[d.ID][i].Water)*100/compareFromfieldArray[d.ID][i].Water)
			}
		}
		if d.ResultType == "sediment" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, (compareTofieldArray[d.ID][i].Sediment-compareFromfieldArray[d.ID][i].Sediment)*100/compareFromfieldArray[d.ID][i].Sediment)
			}
		}

		if d.ResultType == "tp" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, (compareTofieldArray[d.ID][i].Tp-compareFromfieldArray[d.ID][i].Tp)*100/compareFromfieldArray[d.ID][i].Tp)
			}
		}
		if d.ResultType == "tn" {
			for i := 2002; i <= 2011; i++ {
				arrayDataFeatureResultType = append(arrayDataFeatureResultType, (compareTofieldArray[d.ID][i].Tn-compareFromfieldArray[d.ID][i].Tn)*100/compareFromfieldArray[d.ID][i].Tn)
			}
		}
	}

	// fmt.Println(arrayDataFeatureResultType)
	a, err := json.Marshal(arrayDataFeatureResultType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.Write(a)
}

func HandleModelCompare(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var scenario = new(ScenarioInfo)
	err := json.NewDecoder(r.Body).Decode(&scenario)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	globalScenario.ScenarioGet = scenario.ScenarioGet
	// fmt.Println(scenario)

	var fieldCompareResult = make(map[int]*Result)
	var subbasinCompareResult = make(map[int]*Result)

	for i, _ := range compareTosubbasinAverage {
		var s = new(Result)
		s.Water = (compareTosubbasinAverage[i].Water - compareFromsubbasinAverage[i].Water) * 100 / compareFromsubbasinAverage[i].Water
		s.Sediment = (compareTosubbasinAverage[i].Sediment - compareFromsubbasinAverage[i].Sediment) * 100 / compareFromsubbasinAverage[i].Sediment
		s.Tn = (compareTosubbasinAverage[i].Tn - compareFromsubbasinAverage[i].Tn) * 100 / compareFromsubbasinAverage[i].Tn
		s.Tp = (compareTosubbasinAverage[i].Tp - compareFromsubbasinAverage[i].Tp) * 100 / compareFromsubbasinAverage[i].Tp
		subbasinCompareResult[i] = s
	}

	for i, _ := range compareTofieldAverage {
		var s = new(Result)
		if compareTofieldAverage[i].Water != 0 {
			s.Water = (compareTofieldAverage[i].Water - compareFromfieldAverage[i].Water) * 100 / compareFromfieldAverage[i].Water
			s.Sediment = (compareTofieldAverage[i].Sediment - compareFromfieldAverage[i].Sediment) * 100 / compareFromfieldAverage[i].Sediment
			s.Tn = (compareTofieldAverage[i].Tn - compareFromfieldAverage[i].Tn) * 100 / compareFromfieldAverage[i].Tn
			s.Tp = (compareTofieldAverage[i].Tp - compareFromfieldAverage[i].Tp) * 100 / compareFromfieldAverage[i].Tp
		} else {
			s.Water = 0
			s.Sediment = 0
			s.Tn = 0
			s.Tp = 0
		}

		fieldCompareResult[i] = s
	}

	fieldEcoAverageCompareResult := make(map[int]*EcoResult)
	subbasinEcoAverageCompareResult := make(map[int]*EcoResult)

	// fmt.Println(fieldEcoAverageResult[84].Cost)
	// fmt.Println(fieldCompareEcoAverageResult[84].Cost)

	for i, _ := range fieldEcoAverageResult {
		var s = new(EcoResult)
		s.Cost = fieldCompareEcoAverageResult[i].Cost - fieldEcoAverageResult[i].Cost
		s.Revenue = fieldCompareEcoAverageResult[i].Revenue - fieldEcoAverageResult[i].Revenue
		s.NetReturn = fieldCompareEcoAverageResult[i].NetReturn - fieldEcoAverageResult[i].NetReturn
		fieldEcoAverageCompareResult[i] = s
	}

	fmt.Println(len(subbasinCompareEcoAverageResult))
	fmt.Println(len(subbasinEcoAverageResult))

	for i, _ := range subbasinEcoAverageResult {
		var s = new(EcoResult)
		if i != 0 {
			s.Cost = subbasinCompareEcoAverageResult[i].Cost - subbasinEcoAverageResult[i].Cost
			s.Revenue = subbasinCompareEcoAverageResult[i].Revenue - subbasinEcoAverageResult[i].Revenue
			s.NetReturn = subbasinCompareEcoAverageResult[i].NetReturn - subbasinEcoAverageResult[i].NetReturn
		}
		subbasinEcoAverageCompareResult[i] = s
	}

	GenerateResultJsonFile("field", "fieldcompareresult", fieldCompareResult, fieldEcoAverageCompareResult, subbasinEcoAverageCompareResult)
	GenerateResultJsonFile("basin", "basincompareresult", subbasinCompareResult, fieldEcoAverageCompareResult, subbasinEcoAverageCompareResult)

	// fmt.Println(scenario.ScenarioGet)
	OutletCompareResultArray(scenario.ScenarioGet)

	a, err := json.Marshal(outletCompareArray)
	w.Write(a)
}

func GenerateResultJsonFile(sin string, sout string, array map[int]*Result, fieldEcoAverageResult map[int]*EcoResult, subbasinEcoAverageResult map[int]*EcoResult) {
	var featureCollection = new(MapFeature)
	configFile, err := os.Open("./assets/data/geojson/" + sin + ".json")
	if err != nil {
		fmt.Println("fail 1")
	}

	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(&featureCollection); err != nil {
		fmt.Println("fail 2")
	}

	QuartileEcoResult(fieldEcoAverageResult, subbasinEcoAverageResult)
	Quartile(array)

	for id := range array {
		for i := 0; i < len(featureCollection.Features); i++ {
			if strconv.Itoa(id) == featureCollection.Features[i].Properties.Name {
				featureCollection.Features[i].Properties.Flow = array[id].Water
				featureCollection.Features[i].Properties.Sediment = array[id].Sediment
				featureCollection.Features[i].Properties.Tp = array[id].Tp
				featureCollection.Features[i].Properties.Tn = array[id].Tn
				featureCollection.Features[i].Properties.FlowLevel = SelectLevel(array[id].Water, FlowQuartile)
				featureCollection.Features[i].Properties.SedimentLevel = SelectLevel(array[id].Sediment, SedimentQuartile)
				featureCollection.Features[i].Properties.TpLevel = SelectLevel(array[id].Tp, TpQuartile)
				featureCollection.Features[i].Properties.TnLevel = SelectLevel(array[id].Tn, TnQuartile)
				if sin == "field" {
					if id > 600 {
						featureCollection.Features[i].Properties.Cost = 0.0
						featureCollection.Features[i].Properties.NetReturn = 0.0
						featureCollection.Features[i].Properties.Revenue = 0.0

					} else {
						featureCollection.Features[i].Properties.Cost = fieldEcoAverageResult[id].Cost
						featureCollection.Features[i].Properties.NetReturn = fieldEcoAverageResult[id].NetReturn
						featureCollection.Features[i].Properties.Revenue = fieldEcoAverageResult[id].Revenue

						featureCollection.Features[i].Properties.CostLevel = SelectLevel(fieldEcoAverageResult[id].Cost, CostFieldQuartile)
						featureCollection.Features[i].Properties.RevenueLevel = SelectLevel(fieldEcoAverageResult[id].Revenue, RevenueFieldQuartile)
						featureCollection.Features[i].Properties.NetReturnLevel = SelectLevel(fieldEcoAverageResult[id].NetReturn, NetReturnFieldQuartile)
					}
				}
				if sin == "basin" {
					if math.IsNaN(getAverageResult(subbasinEcoResult[id]).Cost) {
						featureCollection.Features[i].Properties.Cost = 0
					} else {
						featureCollection.Features[i].Properties.Cost = subbasinEcoAverageResult[id].Cost
						featureCollection.Features[i].Properties.CostLevel = SelectLevel(subbasinEcoAverageResult[id].Cost, CostSubbasinQuartile)
					}
					if math.IsNaN(getAverageResult(subbasinEcoResult[id]).Revenue) {
						featureCollection.Features[i].Properties.Revenue = 0
					} else {
						featureCollection.Features[i].Properties.Revenue = subbasinEcoAverageResult[id].Revenue
						featureCollection.Features[i].Properties.RevenueLevel = SelectLevel(subbasinEcoAverageResult[id].Revenue, RevenueSubbasinQuartile)
					}
					if math.IsNaN(getAverageResult(subbasinEcoResult[id]).NetReturn) {
						featureCollection.Features[i].Properties.NetReturn = 0
					} else {
						featureCollection.Features[i].Properties.NetReturn = subbasinEcoAverageResult[id].NetReturn
						featureCollection.Features[i].Properties.NetReturnLevel = SelectLevel(subbasinEcoAverageResult[id].NetReturn, NetReturnSubbasinQuartile)
					}
				}
			}
		}
	}

	b, err := json.MarshalIndent(featureCollection, "", "  ")
	// var i = len(featureCollection.Features)
	err = ioutil.WriteFile("./assets/data/geojson/"+sout+".json", b, 0644)
	if err != nil {
		panic(err)
	}
}

func initFieldAverageEcoResultArray(fieldEcoResult map[int]map[int]*EcoResult) map[int]*EcoResult {
	fieldEcoAverageResult := make(map[int]*EcoResult)
	for i, _ := range fieldEcoResult {
		fieldEcoAverageResult[i] = getAverageResult(fieldEcoResult[i])
	}
	return fieldEcoAverageResult
}

func initSubbasinAverageEcoResultArray(subbasinEcoResult map[int]map[int]*EcoResult) map[int]*EcoResult {
	subbasinEcoAverageResult := make(map[int]*EcoResult)
	for i, _ := range subbasinEcoResult {
		subbasinEcoAverageResult[i] = getAverageResult(subbasinEcoResult[i])
	}
	return subbasinEcoAverageResult
}

func BasintoField(database string) {

	subbasinArray = make(map[int]map[int]Result)
	fieldArray = make(map[int]map[int]*Result)

	// fmt.Println(database)
	db, err := sql.Open("sqlite3", "./assets/swat/"+database+".db3")
	checkErr(err)

	//查询数据
	rows, err := db.Query("SELECT id,year,water,sediment,TP,TN FROM sub ")
	checkErr(err)

	for rows.Next() {
		var id int
		var year int
		var water float64
		var sediment float64
		var tp float64
		var tn float64
		err = rows.Scan(&id, &year, &water, &sediment, &tp, &tn)
		checkErr(err)

		if len(subbasinArray[id]) == 0 {
			subbasinArray[id] = make(map[int]Result)
		}

		subbasinArray[id][year] = Result{water, sediment, tp, tn}
	}

	db.Close()

	dbSpatial, err := sql.Open("sqlite3", "./assets/swat/spatial.db3")

	subbasinAreaSearch, err := dbSpatial.Query("SELECT id,area FROM subbasin_area ")
	checkErr(err)

	for subbasinAreaSearch.Next() {
		var id int
		var area float64

		err = subbasinAreaSearch.Scan(&id, &area)
		checkErr(err)

		subbasinArea[id] = area
	}

	fieldAreaSearch, err := dbSpatial.Query("SELECT id,area FROM field_area ")
	checkErr(err)

	for fieldAreaSearch.Next() {
		var id int
		var area float64

		err = fieldAreaSearch.Scan(&id, &area)
		checkErr(err)

		fieldArea[id] = area
	}

	//查询数据
	rowsSpatial, err := dbSpatial.Query("SELECT field,subbasin,percent FROM field_subbasin ")
	checkErr(err)

	for rowsSpatial.Next() {
		var field int
		var subbasin int
		var percentage float64

		err = rowsSpatial.Scan(&field, &subbasin, &percentage)
		checkErr(err)

		if len(fieldArray[field]) == 0 {
			fieldArray[field] = make(map[int]*Result)
		}

		for i := 2002; i < 2012; i++ {

			if fieldArray[field][i] == nil {
				fieldArray[field][i] = new(Result)
			}

			fieldArray[field][i].Water = subbasinArray[subbasin][i].Water*percentage*subbasinArea[subbasin]/fieldArea[field] + fieldArray[field][i].Water
			fieldArray[field][i].Sediment = subbasinArray[subbasin][i].Sediment*percentage*subbasinArea[subbasin]/fieldArea[field] + fieldArray[field][i].Sediment
			fieldArray[field][i].Tp = subbasinArray[subbasin][i].Tp*percentage*subbasinArea[subbasin]/fieldArea[field] + fieldArray[field][i].Tp
			fieldArray[field][i].Tn = subbasinArray[subbasin][i].Tn*percentage*subbasinArea[subbasin]/fieldArea[field] + fieldArray[field][i].Tn
		}
	}
	dbSpatial.Close()

	subbasinAverage = make(map[int]*Result)
	fieldAverage = make(map[int]*Result)

	for k := range subbasinArray {
		var result = new(Result)
		for m := range subbasinArray[k] {
			result.Water = subbasinArray[k][m].Water + result.Water
			result.Sediment = subbasinArray[k][m].Sediment + result.Sediment
			result.Tn = subbasinArray[k][m].Tn + result.Tn
			result.Tp = subbasinArray[k][m].Tp + result.Tp
		}
		subbasinAverage[k] = new(Result)
		subbasinAverage[k].Sediment = result.Sediment / 10
		subbasinAverage[k].Water = result.Water / 10
		subbasinAverage[k].Tn = result.Tn / 10
		subbasinAverage[k].Tp = result.Tp / 10
	}

	for k := range fieldArray {
		var result = new(Result)
		// fmt.Println(fieldArray[k])
		for m := range fieldArray[k] {
			result.Water = fieldArray[k][m].Water + result.Water
			result.Sediment = fieldArray[k][m].Sediment + result.Sediment
			result.Tn = fieldArray[k][m].Tn + result.Tn
			result.Tp = fieldArray[k][m].Tp + result.Tp
		}

		fieldAverage[k] = new(Result)
		fieldAverage[k].Sediment = result.Sediment / 10
		fieldAverage[k].Water = result.Water / 10
		fieldAverage[k].Tn = result.Tn / 10
		fieldAverage[k].Tp = result.Tp / 10

		// fmt.Println(fieldAverage[k])
	}
}

func Quartile(m map[int]*Result) {
	var flowArray []float64
	var sedimentArray []float64
	var tnArray []float64
	var tpArray []float64
	// var costArray []float64

	for i := range m {
		sedimentArray = append(sedimentArray, m[i].Sediment)
		flowArray = append(flowArray, m[i].Water)
		tnArray = append(tnArray, m[i].Tn)
		tpArray = append(tpArray, m[i].Tp)
	}
	// q, _ := stats.Quartile(sedimentArray)

	a1, _ := stats.Percentile(flowArray, 10)
	b1, _ := stats.Percentile(flowArray, 30)
	c1, _ := stats.Percentile(flowArray, 50)
	d1, _ := stats.Percentile(flowArray, 70)
	e1, _ := stats.Percentile(flowArray, 90)
	FlowQuartile = []float64{a1, b1, c1, d1, e1}

	a2, _ := stats.Percentile(sedimentArray, 10)
	b2, _ := stats.Percentile(sedimentArray, 30)
	c2, _ := stats.Percentile(sedimentArray, 50)
	d2, _ := stats.Percentile(sedimentArray, 70)
	e2, _ := stats.Percentile(sedimentArray, 90)
	SedimentQuartile = []float64{a2, b2, c2, d2, e2}

	a3, _ := stats.Percentile(tnArray, 10)
	b3, _ := stats.Percentile(tnArray, 30)
	c3, _ := stats.Percentile(tnArray, 50)
	d3, _ := stats.Percentile(tnArray, 70)
	e3, _ := stats.Percentile(tnArray, 90)
	TnQuartile = []float64{a3, b3, c3, d3, e3}

	a4, _ := stats.Percentile(tpArray, 10)
	b4, _ := stats.Percentile(tpArray, 30)
	c4, _ := stats.Percentile(tpArray, 50)
	d4, _ := stats.Percentile(tpArray, 70)
	e4, _ := stats.Percentile(tpArray, 90)

	TpQuartile = []float64{a4, b4, c4, d4, e4}

	// fmt.Println(FlowQuartile)
	// fmt.Println(SedimentQuartile)
	// fmt.Println(TnQuartile)
	// fmt.Println(TpQuartile) // 4
	// fmt.Println(q)          // {15 37.5 40}}
}

func QuartileEcoResult(fieldEcoAverageResult map[int]*EcoResult, subbasinEcoAverageResult map[int]*EcoResult) {
	var costFieldArray []float64
	var revenueFieldArray []float64
	var netreturnFieldArray []float64

	var costSubbasinArray []float64
	var revenueSubbasinArray []float64
	var netreturnSubbasinArray []float64

	for i, _ := range fieldEcoAverageResult {
		costFieldArray = append(costFieldArray, fieldEcoAverageResult[i].Cost)
		revenueFieldArray = append(revenueFieldArray, fieldEcoAverageResult[i].Revenue)
		netreturnFieldArray = append(netreturnFieldArray, fieldEcoAverageResult[i].NetReturn)
	}

	for i, _ := range subbasinEcoAverageResult {
		costSubbasinArray = append(costSubbasinArray, subbasinEcoAverageResult[i].Cost)
		revenueSubbasinArray = append(revenueSubbasinArray, subbasinEcoAverageResult[i].Revenue)
		netreturnSubbasinArray = append(netreturnSubbasinArray, subbasinEcoAverageResult[i].NetReturn)
	}

	a5, _ := stats.Percentile(costFieldArray, 10)
	b5, _ := stats.Percentile(costFieldArray, 30)
	c5, _ := stats.Percentile(costFieldArray, 50)
	d5, _ := stats.Percentile(costFieldArray, 70)
	e5, _ := stats.Percentile(costFieldArray, 90)
	CostFieldQuartile = []float64{a5, b5, c5, d5, e5}
	// fmt.Println(CostFieldQuartile)

	a6, _ := stats.Percentile(revenueFieldArray, 10)
	b6, _ := stats.Percentile(revenueFieldArray, 30)
	c6, _ := stats.Percentile(revenueFieldArray, 50)
	d6, _ := stats.Percentile(revenueFieldArray, 70)
	e6, _ := stats.Percentile(revenueFieldArray, 90)

	RevenueFieldQuartile = []float64{a6, b6, c6, d6, e6}
	// fmt.Println(RevenueFieldQuartile)

	a7, _ := stats.Percentile(netreturnFieldArray, 10)
	b7, _ := stats.Percentile(netreturnFieldArray, 30)
	c7, _ := stats.Percentile(netreturnFieldArray, 50)
	d7, _ := stats.Percentile(netreturnFieldArray, 70)
	e7, _ := stats.Percentile(netreturnFieldArray, 90)

	NetReturnFieldQuartile = []float64{a7, b7, c7, d7, e7}
	fmt.Println("quartile", NetReturnFieldQuartile)

	a8, _ := stats.Percentile(costSubbasinArray, 10)
	b8, _ := stats.Percentile(costSubbasinArray, 30)
	c8, _ := stats.Percentile(costSubbasinArray, 50)
	d8, _ := stats.Percentile(costSubbasinArray, 70)
	e8, _ := stats.Percentile(costSubbasinArray, 90)
	CostSubbasinQuartile = []float64{a8, b8, c8, d8, e8}
	// fmt.Println(CostSubbasinQuartile)

	a9, _ := stats.Percentile(revenueSubbasinArray, 10)
	b9, _ := stats.Percentile(revenueSubbasinArray, 30)
	c9, _ := stats.Percentile(revenueSubbasinArray, 50)
	d9, _ := stats.Percentile(revenueSubbasinArray, 70)
	e9, _ := stats.Percentile(revenueSubbasinArray, 90)

	RevenueSubbasinQuartile = []float64{a9, b9, c9, d9, e9}
	// fmt.Println(RevenueSubbasinQuartile)

	a10, _ := stats.Percentile(netreturnSubbasinArray, 10)
	b10, _ := stats.Percentile(netreturnSubbasinArray, 30)
	c10, _ := stats.Percentile(netreturnSubbasinArray, 50)
	d10, _ := stats.Percentile(netreturnSubbasinArray, 70)
	e10, _ := stats.Percentile(netreturnSubbasinArray, 90)

	NetReturnSubbasinQuartile = []float64{a10, b10, c10, d10, e10}
	fmt.Println("quartile", NetReturnSubbasinQuartile)
}

var Level = []string{"Great", "Good", "Normal", "Slight", "Bad", "Severe"}

func SelectLevel(v float64, x []float64) (s string) {

	var found bool
	for i := range x {
		if v < x[i] {
			s = Level[i]
			found = true
			return s
		}
	}
	if found != true {
		return Level[len(x)]
	}
	return "Not found"
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}

func OutletResultArray(s string) {
	outletArray = []*OutletResultTypeArray{}

	var outletSedimentArray []float64
	var outletWaterArray []float64
	var outletTnArray []float64
	var outletTpArray []float64

	db, err := sql.Open("sqlite3", "./assets/swat/"+s+".db3")
	checkErr(err)

	//查询数据
	rows, err := db.Query("SELECT id,year,water,sediment,TP,TN FROM rch ")
	checkErr(err)

	for rows.Next() {
		var id int
		var year int
		var water float64
		var sediment float64
		var tp float64
		var tn float64
		err = rows.Scan(&id, &year, &water, &sediment, &tp, &tn)
		checkErr(err)

		for i := 2002; i <= 2011; i++ {
			if id == 33 && year == i {
				outletSedimentArray = append(outletSedimentArray, sediment)
				outletTnArray = append(outletTnArray, tn)
				outletTpArray = append(outletTpArray, tp)
				outletWaterArray = append(outletWaterArray, water)
			}
		}
	}
	var sedimentdataArray = new(OutletResultTypeArray)
	sedimentdataArray.ResultType = "sediment"
	sedimentdataArray.ResultData = outletSedimentArray
	outletArray = append(outletArray, sedimentdataArray)

	var flowdataArray = new(OutletResultTypeArray)
	flowdataArray.ResultType = "flow"
	flowdataArray.ResultData = outletWaterArray
	outletArray = append(outletArray, flowdataArray)

	var tpdataArray = new(OutletResultTypeArray)
	tpdataArray.ResultType = "tp"
	tpdataArray.ResultData = outletTpArray
	outletArray = append(outletArray, tpdataArray)

	var tndataArray = new(OutletResultTypeArray)
	tndataArray.ResultType = "tn"
	tndataArray.ResultData = outletTnArray
	outletArray = append(outletArray, tndataArray)

	db.Close()
}

func OutletCompareResultArray(s string) {
	outletCompareArray = []*OutletResultTypeArray{}

	var outletSedimentArray []float64
	var outletWaterArray []float64
	var outletTnArray []float64
	var outletTpArray []float64

	db, err := sql.Open("sqlite3", "./assets/swat/"+s+".db3")
	checkErr(err)

	//查询数据
	rows, err := db.Query("SELECT id,year,water,sediment,TP,TN FROM rch ")
	checkErr(err)

	for rows.Next() {
		var id int
		var year int
		var water float64
		var sediment float64
		var tp float64
		var tn float64
		err = rows.Scan(&id, &year, &water, &sediment, &tp, &tn)
		checkErr(err)

		for i := 2002; i <= 2011; i++ {
			if id == 33 && year == i {
				outletSedimentArray = append(outletSedimentArray, sediment)
				outletTnArray = append(outletTnArray, tn)
				outletTpArray = append(outletTpArray, tp)
				outletWaterArray = append(outletWaterArray, water)
			}
		}
	}

	var outletCompareSedimentArray []float64
	var outletCompareWaterArray []float64
	var outletCompareTnArray []float64
	var outletCompareTpArray []float64

	db, err = sql.Open("sqlite3", "./assets/swat/result.db3")
	checkErr(err)

	//查询数据
	rows, err = db.Query("SELECT id,year,water,sediment,TP,TN FROM rch ")
	checkErr(err)

	for rows.Next() {
		var id int
		var year int
		var water float64
		var sediment float64
		var tp float64
		var tn float64
		err = rows.Scan(&id, &year, &water, &sediment, &tp, &tn)
		checkErr(err)

		for i := 2002; i <= 2011; i++ {
			if id == 33 && year == i {
				outletCompareSedimentArray = append(outletCompareSedimentArray, sediment)
				outletCompareTnArray = append(outletCompareTnArray, tn)
				outletCompareTpArray = append(outletCompareTpArray, tp)
				outletCompareWaterArray = append(outletCompareWaterArray, water)
			}
		}
	}

	var outletCompareResultSedimentArray []float64
	var outletCompareResultWaterArray []float64
	var outletCompareResultTnArray []float64
	var outletCompareResultTpArray []float64

	for i := 0; i < len(outletSedimentArray); i++ {
		outletCompareResultSedimentArray = append(outletCompareResultSedimentArray, (outletCompareSedimentArray[i]-outletSedimentArray[i])*100/outletSedimentArray[i])
		outletCompareResultWaterArray = append(outletCompareResultWaterArray, (outletCompareWaterArray[i]-outletWaterArray[i])*100/outletWaterArray[i])
		outletCompareResultTnArray = append(outletCompareResultTnArray, (outletCompareTnArray[i]-outletTnArray[i])*100/outletTnArray[i])
		outletCompareResultTpArray = append(outletCompareResultTpArray, (outletCompareTpArray[i]-outletTpArray[i])*100/outletTpArray[i])
	}

	var sedimentdataArray = new(OutletResultTypeArray)
	sedimentdataArray.ResultType = "sediment"
	sedimentdataArray.ResultData = outletCompareResultSedimentArray
	outletCompareArray = append(outletCompareArray, sedimentdataArray)

	var flowdataArray = new(OutletResultTypeArray)
	flowdataArray.ResultType = "flow"
	flowdataArray.ResultData = outletCompareResultWaterArray
	outletCompareArray = append(outletCompareArray, flowdataArray)

	var tpdataArray = new(OutletResultTypeArray)
	tpdataArray.ResultType = "tp"
	tpdataArray.ResultData = outletCompareResultTpArray
	outletCompareArray = append(outletCompareArray, tpdataArray)

	var tndataArray = new(OutletResultTypeArray)
	tndataArray.ResultType = "tn"
	tndataArray.ResultData = outletCompareResultTnArray
	outletCompareArray = append(outletCompareArray, tndataArray)

	db.Close()
}

type OptimizationConfig struct {
	OptimizationMode string
	BaseScenario     string
	FieldIDs         string
	ConstrainType    string
	UpperLimit       string
	LowerLimit       string
	IncludedBMPs     string
	StartYear        string
	EndYear          string
	IsIncrementMode  string
	IterationNumber  string
	OutPath          string
	IsUpDown         string
	OutUpDownPath    string
}

type OptimizationConfigInfo struct {
	SelectedLayer      string
	SelectedFeatureIDs []string
	OptimizationMode   string
	SelectedType       string
	LowerLimit         string
	UpperLimit         string
}

type LowerUpperLimits struct {
	LowerLimit string
	UpperLimit string
}

type ResultData struct {
	FeatureID          int
	FeatureBMPAssigned string
	Iteration          int
	EcoResult          float64
	EnvResult          *Result
}

type OptChartData struct {
	NetReturn    float64
	IterationNum int
	Water        float64
	Sediment     float64
	TP           float64
	TN           float64
}

func HandleOptimizationLimites(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var d = new(OptimizationConfigInfo)

	err := json.NewDecoder(r.Body).Decode(&d)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	// fmt.Println(d.SelectedLayer)
	// fmt.Println(d.OptimizationMode)
	// fmt.Println(d.SelectedFeatureIDs)
	// fmt.Println(d.SelectedType)

	var featureIDString = ""
	for i := 0; i < len(d.SelectedFeatureIDs); i++ {
		featureIDString = d.SelectedFeatureIDs[i] + ";" + featureIDString
	}

	featureIDString = featureIDString[:len(featureIDString)-1]

	optimizationConfig := new(OptimizationConfig)
	optimizationConfig.OptimizationMode = d.OptimizationMode
	optimizationConfig.BaseScenario = "Conventional"
	optimizationConfig.FieldIDs = featureIDString
	optimizationConfig.ConstrainType = d.SelectedType
	optimizationConfig.UpperLimit = "0"
	optimizationConfig.LowerLimit = "0"
	optimizationConfig.IncludedBMPs = "true;true;true;true"
	optimizationConfig.StartYear = "2000"
	optimizationConfig.EndYear = "2011"
	optimizationConfig.IsIncrementMode = "true"
	optimizationConfig.IterationNumber = "10"
	optimizationConfig.OutPath = "C:\\xxKun_Learn\\Go\\Go\\src\\wppgis\\assets\\WEBsOptimization\\OptOut.db3"
	optimizationConfig.IsUpDown = "true"
	optimizationConfig.OutUpDownPath = "C:\\xxKun_Learn\\Go\\Go\\src\\wppgis\\assets\\WEBsOptimization\\UpLow.txt"

	optimizationConfigJson, err := json.Marshal(optimizationConfig)
	check(err)
	err = ioutil.WriteFile("./assets/WEBsOptimization/optimization.txt", optimizationConfigJson, 0644)
	check(err)

	done := make(chan bool, 1)
	go func() {

		cmd := "java"
		args := []string{"-jar", "./assets/WEBsOptimization/WEBsInterface_WB.jar"}
		if err := exec.Command(cmd, args...).Run(); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		done <- true

	}()

	fmt.Println("awaiting")

	<-done

	if _, err := os.Stat("./assets/WEBsOptimization/done.txt"); err == nil {
		fmt.Println("complete")
	}

	fileString := readFile("./assets/WEBsOptimization/UpLow.txt")
	// fmt.Println(fileString)

	re := regexp.MustCompile("(-|\\d)\\d?.\\d+")
	limitsSlice := re.FindAllString(fileString, -1)
	// fmt.Println(re.FindAllString(fileString, -1))

	var lowerUpperLimits = new(LowerUpperLimits)
	lowerUpperLimits.LowerLimit = limitsSlice[1]
	lowerUpperLimits.UpperLimit = limitsSlice[0]

	// fmt.Println(limitsSlice[1])
	// fmt.Println(limitsSlice[0])

	// create json response from struct
	a, err := json.Marshal(lowerUpperLimits)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.Write(a)
}

func HandleOptimizationRun(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var d = new(OptimizationConfigInfo)

	err := json.NewDecoder(r.Body).Decode(&d)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	var featureIDString = ""

	for i := 0; i < len(d.SelectedFeatureIDs); i++ {
		featureIDString = d.SelectedFeatureIDs[i] + ";" + featureIDString
	}

	featureIDString = featureIDString[:len(featureIDString)-1]

	optimizationConfig := new(OptimizationConfig)
	optimizationConfig.OptimizationMode = d.OptimizationMode
	optimizationConfig.BaseScenario = "Conventional"
	optimizationConfig.FieldIDs = featureIDString
	optimizationConfig.ConstrainType = d.SelectedType
	optimizationConfig.UpperLimit = d.UpperLimit
	optimizationConfig.LowerLimit = d.LowerLimit
	optimizationConfig.IncludedBMPs = "true;true;true;true"
	optimizationConfig.StartYear = "2000"
	optimizationConfig.EndYear = "2011"
	optimizationConfig.IsIncrementMode = "true"
	optimizationConfig.IterationNumber = "10"
	optimizationConfig.OutPath = "C:\\xxKun_Learn\\Go\\Go\\src\\wppgis\\assets\\WEBsOptimization\\OptOut.db3"
	optimizationConfig.IsUpDown = "false"
	optimizationConfig.OutUpDownPath = "C:\\xxKun_Learn\\Go\\Go\\src\\wppgis\\assets\\WEBsOptimization\\UpLow.txt"

	optimizationConfigJson, err := json.Marshal(optimizationConfig)
	check(err)
	err = ioutil.WriteFile("./assets/WEBsOptimization/optimization.txt", optimizationConfigJson, 0644)
	check(err)

	done := make(chan bool, 1)
	go func() {

		cmd := exec.Command("java", "-jar", "C:/xxKun_Learn/Go/Go/src/wppgis/assets/WEBsOptimization/WEBsInterface_WB.jar")
		cmd.Dir = "C:/xxKun_Learn/Go/Go/src/wppgis/assets/WEBsOptimization"
		cmd.Run()
		// cmd := "java"
		// args := []string{"-jar", "./assets/WEBsOptimization/WEBsInterface_WB.jar"}
		// if err := exec.Command(cmd, args...).Run(); err != nil {
		// 	fmt.Fprintln(os.Stderr, err)
		// 	os.Exit(1)
		// }
		done <- true

	}()

	fmt.Println("awaiting")

	<-done

	optResultDB := createSQLConnector("./assets/WEBsOptimization/OptOut.db3")
	generateOptResultJsonFiles(optResultDB)
	// createOptGeoJson(resultDataSet)

	var optChartDataSet = getOptChartDataSet(optResultDB)
	optResultDB.Close()

	a, err := json.Marshal(optChartDataSet)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.Write(a)
}

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func readFile(path string) string {
	f, err := os.Open(path)
	check(err)
	b1 := make([]byte, 100)
	n1, err := f.Read(b1)
	check(err)
	fmt.Printf("%d bytes: %s\n", n1, string(b1))
	return string(b1)
}

func createSQLConnector(path string) *sql.DB {
	optResultDB, err := sql.Open("sqlite3", path)
	check(err)
	return optResultDB
}

func getResultByIteration(optResultDB *sql.DB, iteration int) []*ResultData {

	var resultDataSet []*ResultData

	var rows *sql.Rows
	var err error

	switch iteration {
	case 2001:
		rows, err = optResultDB.Query("select * from Iter_000_field")
	case 2002:
		rows, err = optResultDB.Query("select * from Iter_001_field")
	case 2003:
		rows, err = optResultDB.Query("select * from Iter_002_field")
	case 2004:
		rows, err = optResultDB.Query("select * from Iter_003_field")
	case 2005:
		rows, err = optResultDB.Query("select * from Iter_004_field")
	case 2006:
		rows, err = optResultDB.Query("select * from Iter_005_field")
	case 2007:
		rows, err = optResultDB.Query("select * from Iter_006_field")
	case 2008:
		rows, err = optResultDB.Query("select * from Iter_007_field")
	case 2009:
		rows, err = optResultDB.Query("select * from Iter_008_field")
	case 2010:
		rows, err = optResultDB.Query("select * from Iter_009_field")
	default:
		fmt.Println("the year does not exist!")
	}

	if err != nil {
		panic(err)
	}
	for rows.Next() {
		resultData := new(ResultData)
		var featureID int
		var featureBMPAssigned string
		var netReturn float64
		var water float64
		var sediment float64
		var tn float64
		var tp float64
		err = rows.Scan(&featureID, &featureBMPAssigned, &netReturn, &water, &sediment, &tn, &tp)
		if err != nil {
			panic(err)
		}
		resultData.FeatureID = featureID
		resultData.Iteration = iteration
		resultData.FeatureBMPAssigned = featureBMPAssigned
		resultData.EcoResult = netReturn
		resultData.EnvResult = new(Result)
		resultData.EnvResult.Water = water
		resultData.EnvResult.Sediment = sediment
		resultData.EnvResult.Tn = tn
		resultData.EnvResult.Tp = tp
		// fmt.Println(*resultData)
		resultDataSet = append(resultDataSet, resultData)
	}

	return resultDataSet
}

func generateOptResultJsonFiles(optResultDB *sql.DB) {

	for i := 2001; i < 2011; i++ {
		var resultDataSet = getResultByIteration(optResultDB, i)
		var tempResultsforFileCreation = make(map[int]*Result)
		var tempFeatureAssignedBMPs = make(map[int]string)
		for j := 0; j < len(resultDataSet); j++ {
			tempResultsforFileCreation[resultDataSet[j].FeatureID] = resultDataSet[j].EnvResult
			tempFeatureAssignedBMPs[resultDataSet[j].FeatureID] = resultDataSet[j].FeatureBMPAssigned
		}
		GenerateOptResultJsonFile("field", "optfield"+strconv.Itoa(i), tempResultsforFileCreation, tempFeatureAssignedBMPs)

	}

}
func GenerateOptResultJsonFile(sin string, sout string, array map[int]*Result, assignedBMPs map[int]string) {
	var featureCollection = new(MapFeature)
	configFile, err := os.Open("./assets/data/geojson/" + sin + ".json")
	if err != nil {
		fmt.Println("fail 1")
	}

	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(&featureCollection); err != nil {
		fmt.Println("fail 2")
	}

	for id := range array {
		for i := 0; i < len(featureCollection.Features); i++ {
			if strconv.Itoa(id) == featureCollection.Features[i].Properties.Name {
				featureCollection.Features[i].Properties.Flow = array[id].Water
				featureCollection.Features[i].Properties.Sediment = array[id].Sediment
				featureCollection.Features[i].Properties.Tp = array[id].Tp
				featureCollection.Features[i].Properties.Tn = array[id].Tn
				featureCollection.Features[i].Properties.OptBMPs = assignedBMPs[id]
			}
		}
	}

	b, err := json.MarshalIndent(featureCollection, "", "  ")
	// var i = len(featureCollection.Features)
	err = ioutil.WriteFile("./assets/data/geojson/"+sout+".json", b, 0644)
	if err != nil {
		panic(err)
	}
}

func getOptChartDataSet(optResultDB *sql.DB) []*OptChartData {
	var rows *sql.Rows
	var err error
	rows, err = optResultDB.Query("select * from OptMaster")
	var optChartDataSet []*OptChartData
	for rows.Next() {
		var optChartData = new(OptChartData)
		var iteration int
		var netReturn float64
		var water float64
		var sediment float64
		var tp float64
		var tn float64
		err = rows.Scan(&iteration, &netReturn, &water, &sediment, &tn, &tp)
		if err != nil {
			panic(err)
		}
		optChartData.IterationNum = iteration
		optChartData.NetReturn = netReturn
		optChartData.Water = water
		optChartData.Sediment = sediment
		optChartData.TN = tn
		optChartData.TP = tp
		optChartDataSet = append(optChartDataSet, optChartData)
	}
	return optChartDataSet
}

// ---------------------------------------------------------------------------------------------------------------

func updateEconomicByFieldID(fieldID int, bmpCode int) map[int]*EcoResult {

	economicDB, err := sql.Open("sqlite3", "./assets/swat/spatial.db3")
	checkErr(err)
	var rows = new(sql.Rows)
	if bmpCode == 3 {
		rows, err = economicDB.Query("SELECT field,year,revenue,cost,netreturn from yield_conservation_tillage")
		checkErr(err)
	} else if bmpCode == 4 {
		rows, err = economicDB.Query("SELECT field,year,revenue,cost,netreturn from yield_NMAN")
		checkErr(err)
	} else if bmpCode == 5 {
		rows, err = economicDB.Query("SELECT field,year,revenue,cost,netreturn from yield_cover_crop")
		checkErr(err)
	} else if bmpCode == 6 {
		rows, err = economicDB.Query("SELECT field,year,revenue,cost,netreturn from yield_con_til_NMAN")
		checkErr(err)
	} else if bmpCode == 7 {
		rows, err = economicDB.Query("SELECT field,year,revenue,cost,netreturn from yield_con_til_cov_crp")
		checkErr(err)
	} else if bmpCode == 8 {
		rows, err = economicDB.Query("SELECT field,year,revenue,cost,netreturn from yield_NMAN_cov_crp")
		checkErr(err)
	} else if bmpCode == 9 {
		rows, err = economicDB.Query("SELECT field,year,revenue,cost,netreturn from yield_all_BMPs")
		checkErr(err)
	} else {
		rows, err = economicDB.Query("SELECT field,year,revenue,cost,netreturn from yield_historic")
		checkErr(err)
	}

	for rows.Next() {
		var id int
		var year int
		var revenue float64
		var cost float64
		var netreturn float64
		err = rows.Scan(&id, &year, &revenue, &cost, &netreturn)
		checkErr(err)

		if fieldID == id {
			if len(fieldEcoResult[id]) == 0 {
				fieldEcoResult[id] = make(map[int]*EcoResult)
			}
			fieldEcoResult[id][year] = &EcoResult{cost, revenue, netreturn}
		}

	}

	// for m := range results[fieldID] {
	// 	fmt.Println(results[fieldID][m])
	// }
	economicDB.Close()
	return fieldEcoResult[fieldID]
}

func updateEconomicBySubbasinID(subbasinID int, bmpCode int) map[int]*EcoResult {
	subbasinEcoResult[subbasinID] = make(map[int]*EcoResult)
	// var resultByYear = make(map[int]*EcoResult)
	spatialDB, err := sql.Open("sqlite3", "./assets/swat/spatial.db3")
	checkErr(err)
	rows, err := spatialDB.Query("SELECT * from field_subbasin")
	checkErr(err)
	var fieldofSubbasin = make(map[int]float64)
	for rows.Next() {
		var field int
		var subbasin int
		var percentage float64
		err = rows.Scan(&field, &subbasin, &percentage)
		checkErr(err)
		if subbasin == subbasinID {
			fieldofSubbasin[field] = percentage
		}
	}

	for i, j := range fieldofSubbasin {

		for y, _ := range updateEconomicByFieldID(i, bmpCode) {
			// if len(subbasinEcoResult[subbasinID]) == 0 {
			// 	subbasinEcoResult[subbasinID] = make(map[int]*EcoResult)
			// }
			if subbasinEcoResult[subbasinID][y] == nil {
				subbasinEcoResult[subbasinID][y] = new(EcoResult)
			}
			// fmt.Println(updateEconomicByFieldID(i, bmpCode)[y].Cost, j, y)
			subbasinEcoResult[subbasinID][y].Cost += updateEconomicByFieldID(i, bmpCode)[y].Cost * j
			// fmt.Println(updateEconomicByFieldID(i, bmpCode)[y].Revenue, j, y)
			subbasinEcoResult[subbasinID][y].Revenue += updateEconomicByFieldID(i, bmpCode)[y].Revenue * j
			// fmt.Println(updateEconomicByFieldID(i, bmpCode)[y].NetReturn, j, y)
			subbasinEcoResult[subbasinID][y].NetReturn += updateEconomicByFieldID(i, bmpCode)[y].NetReturn * j
		}
	}

	// for m := range results[subbasinID] {
	// 	fmt.Println(results[subbasinID][m])
	// }
	spatialDB.Close()
	return subbasinEcoResult[subbasinID]
}

func initFeatureArray() {
	spatialDB, err := sql.Open("sqlite3", "./assets/swat/spatial.db3")
	checkErr(err)
	rows, err := spatialDB.Query("SELECT id,area from field_area")
	checkErr(err)
	for rows.Next() {
		var fieldID int
		var area float64
		rows.Scan(&fieldID, &area)
		fieldIDArray[fieldID] = area
	}

	rows, err = spatialDB.Query("SELECT id,area from subbasin_area")
	checkErr(err)
	for rows.Next() {
		var fieldID int
		var area float64
		rows.Scan(&fieldID, &area)
		subbasinIDArray[fieldID] = area
	}
	spatialDB.Close()
	// fmt.Println(len(fieldIDArray))
	// fmt.Println(len(subbasinIDArray))
}

func initEcoData(s string) (map[int]map[int]*EcoResult, map[int]map[int]*EcoResult) {
	var fieldEcoResult = make(map[int]map[int]*EcoResult)
	var subbasinEcoResult = make(map[int]map[int]*EcoResult)
	spatialDB, err := sql.Open("sqlite3", "./assets/swat/spatial.db3")
	checkErr(err)
	rows, err := spatialDB.Query("SELECT field,year,revenue,cost,netreturn from " + s)
	checkErr(err)
	for rows.Next() {
		var fieldID int
		var year int
		var revenue float64
		var cost float64
		var netreturn float64
		rows.Scan(&fieldID, &year, &revenue, &cost, &netreturn)
		if len(fieldEcoResult[fieldID]) == 0 {
			fieldEcoResult[fieldID] = make(map[int]*EcoResult)
		}
		fieldEcoResult[fieldID][year] = &EcoResult{cost, revenue, netreturn}
	}

	for z, _ := range subbasinIDArray {
		rows, err = spatialDB.Query("SELECT * from field_subbasin")
		checkErr(err)
		var fieldofSubbasin = make(map[int]float64)
		for rows.Next() {
			var field int
			var subbasin int
			var percentage float64
			err = rows.Scan(&field, &subbasin, &percentage)
			checkErr(err)
			if subbasin == z {
				fieldofSubbasin[field] = percentage
			}
		}
		for i, j := range fieldofSubbasin {
			for y, _ := range fieldEcoResult[i] {
				if len(subbasinEcoResult[z]) == 0 {
					subbasinEcoResult[z] = make(map[int]*EcoResult)
				}
				if subbasinEcoResult[z][y] == nil {
					subbasinEcoResult[z][y] = new(EcoResult)
				}
				subbasinEcoResult[z][y].Cost += fieldEcoResult[i][y].Cost * j
				subbasinEcoResult[z][y].Revenue += fieldEcoResult[i][y].Revenue * j
				subbasinEcoResult[z][y].NetReturn += fieldEcoResult[i][y].NetReturn * j
			}
		}
	}

	// fmt.Println(len(fieldEcoResult))
	// fmt.Println(len(subbasinEcoResult))
	spatialDB.Close()
	return fieldEcoResult, subbasinEcoResult
}

func initConvertTable() {
	spatialDB, err := sql.Open("sqlite3", "./assets/swat/spatial.db3")
	checkErr(err)
	rows, err := spatialDB.Query("SELECT field,subbasin,percent from field_subbasin")
	checkErr(err)
	for rows.Next() {
		var fieldID int
		var subbasinID int
		var percent float64
		rows.Scan(&fieldID, &subbasinID, &percent)
		if len(fieldInSubbasin[fieldID]) == 0 {
			fieldInSubbasin[fieldID] = make(map[int]float64)
		}
		fieldInSubbasin[fieldID][subbasinID] = percent
	}

	rows, err = spatialDB.Query("SELECT field,subbasin,percent from subbasin_field")
	checkErr(err)
	for rows.Next() {
		var fieldID int
		var subbasinID int
		var percent float64
		rows.Scan(&fieldID, &subbasinID, &percent)
		if len(subbasinInField[subbasinID]) == 0 {
			subbasinInField[subbasinID] = make(map[int]float64)
		}
		subbasinInField[subbasinID][fieldID] = percent
	}

	spatialDB.Close()
	// fmt.Println(fieldInSubbasin[63])
	// fmt.Println(subbasinInField[975])
}

func subbasinEcoResultFromField(subbasinID int) map[int]*EcoResult {
	var ecoResultBySubbasinID = make(map[int]*EcoResult)
	for i, j := range subbasinInField[subbasinID] {
		for y, _ := range fieldEcoResult[i] {
			if ecoResultBySubbasinID[y] == nil {
				ecoResultBySubbasinID[y] = new(EcoResult)
			}
			ecoResultBySubbasinID[y].Cost += fieldEcoResult[i][y].Cost * j
			ecoResultBySubbasinID[y].Revenue += fieldEcoResult[i][y].Revenue * j
			ecoResultBySubbasinID[y].NetReturn += fieldEcoResult[i][y].NetReturn * j
		}
	}
	// fmt.Println(ecoResultBySubbasinID)
	return ecoResultBySubbasinID
}

func fieldEcoResultFromSubbasin(fieldID int) map[int]*EcoResult {
	var ecoResultByFieldID = make(map[int]*EcoResult)
	for i, j := range fieldInSubbasin[fieldID] {
		for y, _ := range subbasinEcoResult[i] {
			if ecoResultByFieldID[y] == nil {
				ecoResultByFieldID[y] = new(EcoResult)
			}
			ecoResultByFieldID[y].Cost += subbasinEcoResult[i][y].Cost * j
			ecoResultByFieldID[y].Revenue += subbasinEcoResult[i][y].Revenue * j
			ecoResultByFieldID[y].NetReturn += subbasinEcoResult[i][y].NetReturn * j
		}
	}
	// fmt.Println(ecoResultByFieldID)
	return ecoResultByFieldID
}

func getAverageResult(ecoResult map[int]*EcoResult) *EcoResult {
	var ecoAverageResult = new(EcoResult)
	for i, _ := range ecoResult {
		ecoAverageResult.Cost += ecoResult[i].Cost
		ecoAverageResult.Revenue += ecoResult[i].Revenue
		ecoAverageResult.NetReturn += ecoResult[i].NetReturn
	}
	ecoAverageResult.Cost = ecoAverageResult.Cost / float64(len(ecoResult))
	ecoAverageResult.Revenue = ecoAverageResult.Revenue / float64(len(ecoResult))
	ecoAverageResult.NetReturn = ecoAverageResult.NetReturn / float64(len(ecoResult))
	// fmt.Println(ecoAverageResult)
	return ecoAverageResult
}
