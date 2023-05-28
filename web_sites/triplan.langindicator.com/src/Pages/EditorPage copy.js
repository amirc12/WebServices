import './EditorPage.css';
import * as React from 'react';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const moment = require("moment");
const constants = require("../constants");

const WEEK_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const sx = 
{
    '& label': 
    {
      transformOrigin: 'right !important',
      left: 'inherit !important',
      right: '1.75rem !important',
    },
    '& legend': { textAlign: 'right' },
    '&  .MuiFormHelperText-root.Mui-error': { textAlign: 'right'}
 };

const styles =
{
    button         : {height: '35px', marginTop: '20px', backgroundColor: 'rgb(37, 98, 183)', color: 'white', textTransform: 'none', fontSize: '16px', fontWeight: 'bold', width: '100%'},
    addButton      : {height: '25px', marginTop: '10px', marginLeft: '10px', color: 'rgb(37, 98, 183)', border: '1px solid rgb(37, 98, 183)', backgroundColor: 'white', textTransform: 'none', fontSize: '16px'},
    deleteButton   : {flex: '2', height: '35px', marginTop: '10px', marginLeft: '10px', color: 'red', border: '1px solid red', backgroundColor: 'white', textTransform: 'none', fontSize: '16px', fontWeight: 'bold'},
    filterInput    : {height: '25px', width: '60px', marginLeft: '10px'},
    infoField      : {flex: '1', marginTop: '10px', backgroundColor: 'rgb(247, 248, 249)', width: '100%', direction: 'rtl'},
    itemField      : {flex: '1', marginTop: '3px', backgroundColor: 'white', width: '100%', direction: 'rtl'},
    cardTitle      : {display: 'flex', alignItems: 'center', backgroundColor: 'lightblue', color: 'black', paddingLeft: '20px', borderBottom: '1px solid gray'},
    tripLoader     : {margin: 'auto', marginTop: '10%', width: '400px', border: '1px solid lightgray', padding: '50px', direction: 'ltr', borderRadius: '10px', backgroundColor: 'rgb(242, 246, 251)'},
    datesContainer : {paddingTop: '5px', paddingBottom: '10px', display: 'flex', columnGap: '20px'}
};

async function fetchTripPlan(planId)
{
    const url      = `${constants.API_URL}/load?id=${planId}`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    return data;
}

async function postTripPlan(tripPlan)
{
    const options =
    {
        method  : "POST",
        headers : {},
        body    : JSON.stringify(tripPlan)
    };

    try
    {
        const url      = `${constants.API_URL}/update`;
        const response = await fetch (url, options);
        const data     = await response.json();    
    }
    catch(e)
    {
        console.log(e);
        // debugger;
    }
}

function getTripDays(data)
{
    const date1 = new Date(data.start_date);
    const date2 = new Date(data.end_date);
    
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
}

function InfoTextField({style=styles.infoField, label, fieldKey, text, onDataChange})
{
    function onChange(e)
    {
        onDataChange(fieldKey, e.target.value);
    }

    return(<TextField sx={sx} style={style} size='small' label={label} defaultValue={text} onChange={onChange}/>);
}

function DayItem({data, onDataChange})
{
    const [isEditMode, setIsEditMode] = useState(false);
    const [dayItem, setDayItem]       = useState(data);
    const [itemText, setItemText]     = useState(data.text);

    function onChange(e)
    {
        dayItem.text = e.target.value;
        // setDayItem({...dayItem});
        onDataChange({...dayItem});
    }

    function handleDataChange()
    {

    }

    return(
        <div className='day_item'>
            <Button style={{flex: '1'}} variant="text" onClick={() => setIsEditMode(!isEditMode)}>{isEditMode ? 'סגירה' : 'עריכה'}</Button>
            {isEditMode
            ?
                <div>
                    <TextField sx={sx} style={styles.itemField} size='small' label='כותרת' defaultValue={data.title} onChange={handleDataChange}/>
                    <TextField sx={sx} style={styles.itemField} size='small' label='תוכן' defaultValue={data.content} onChange={handleDataChange} multiline rows={3}/>
                    <TextField sx={sx} style={styles.itemField} size='small' label='כתובת' defaultValue={data.address} onChange={handleDataChange}/>
                    <TextField sx={sx} style={styles.itemField} size='small' label='קישור לאתר אינטרנט' defaultValue={data.link} onChange={handleDataChange}/>
                </div>
            :
                <div>
                     <div>{data.title}</div>
                     <div style={{whiteSpace: "pre-wrap"}}>{data.content}</div>
                     <div>{data.address}</div>
                     <div>{data.link}</div>
                </div>
            }
        </div>
    );
}

{/* <InfoTextField style={styles.itemField} fieldKey="title" label="כותרת" text={data.title} onDataChange={handleDataChange} />
<InfoTextField style={styles.itemField} fieldKey="content" label="תוכן" text={data.content} onDataChange={handleDataChange} />
<InfoTextField style={styles.itemField} fieldKey="address" label="כתובת" text={data.address} onDataChange={handleDataChange} />
<InfoTextField style={styles.itemField} fieldKey="link" label="קישור לאתר אינטרנט" text={data.link} onDataChange={handleDataChange} /> */}

function DayCard({data, onDayChange, onDayDelete})
{
    const [isExpand, setIsExpand] = useState(false);
    const [dayPlan, setDayPlan]   = useState(data);

    function onAddItem(type)
    {
        const number = dayPlan.items.length + 1;
        dayPlan.items.push({number: number, type: type, title: 'כותרת', content: 'תוכן', address: 'כתובת', link: 'קישור'});
        onDayChange({...dayPlan});
    }

    function handleDataChange(data)
    {
        const items = dayPlan.items.map(item => item.number === data.number ? { ...item, ...data } : item);
        setDayPlan({...dayPlan, items: items});
    }

    const items = dayPlan.items.map((item) => <DayItem data={item} onDataChange={handleDataChange}/>);

    const titleText = `${data.number}. יום ${data.week_day}, ${data.date}`;
    return(
        <div className='day_card'>
            <div className='day_card_title'>
                <div style={{flex: '12'}}>{titleText}</div>
                <IconButton style={{flex: '1'}} onClick={() => setIsExpand(!isExpand)}>{isExpand ? <ExpandLessIcon/> : <ExpandMoreIcon/>}</IconButton>
            </div>
            <div className={isExpand ? 'trip_info_content' : 'content_hide'}>
                {items}
                <Button style={styles.addButton} onClick={() => onAddItem('attraction')}>הוספת מקטע</Button>
            </div>
        </div>
    );
}

function TripInfo({data, onDataChange})
{
    const [isExpand, setIsExpand] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    function handleDataChange(fieldKey, value)
    {
        let newPlan = {...data};
        newPlan[fieldKey] = value;
        onDataChange(newPlan);
    }

    return(
        <div className='trip_info'>   
            <div className='trip_info_title'>
                <div style={{flex: '10'}}>מידע כללי</div>
                <Button style={{flex: '1'}} variant="text" onClick={() => setIsEditMode(!isEditMode)}>{isEditMode ? 'סגירה' : 'עריכה'}</Button>
                <IconButton style={{flex: '1'}} onClick={() => setIsExpand(!isExpand)}>{isExpand || isEditMode ? <ExpandLessIcon/> : <ExpandMoreIcon/>}</IconButton>
            </div>
            <div className={isExpand || isEditMode ? 'trip_info_content' : 'content_hide'}>
                {isEditMode 
                ? 
                    <div>
                        <InfoTextField fieldKey="title"      label="כותרת"       text={data.title}      onDataChange={handleDataChange} />
                        <InfoTextField fieldKey="sub_title"  label="כותרת משנה"  text={data.sub_title}  onDataChange={handleDataChange} />
                        <div style={styles.datesContainer}>
                            <InfoTextField fieldKey="start_date" label="תאריך התחלה" text={data.start_date} onDataChange={handleDataChange} />
                            <InfoTextField fieldKey="end_date"   label="תאריך סיום"  text={data.end_date}   onDataChange={handleDataChange} />
                        </div>
                    </div> 
                : 
                    <div>
                        <div>{data.title}</div>
                        <div>{data.sub_title}</div>
                        <div style={styles.datesContainer}>
                            <div>{data.start_date}</div>
                            <div>{data.end_date}</div>
                        </div>                  
                    </div>
                }
            </div>
        </div>
    );
}

function TripPlan({data, onDataChange})
{
    const [tripPlan, setTripPlan] = useState(data);

    function onAddDay()
    {       
        const dayNumber = tripPlan.days.length + 1;

        const date = moment(tripPlan.start_date).add(dayNumber, "days").format("DD/MM/YYYY");
        const weekDay = moment(tripPlan.start_date).add(dayNumber, "days").weekday();

        tripPlan.days.push({number: dayNumber, date: date, week_day: WEEK_DAYS[weekDay], items: []});
        setTripPlan({...tripPlan});
    }

    async function onSaveChanges()
    {
        await postTripPlan(tripPlan);
    }

    function handleTripInfoChange(data)
    {
        setTripPlan(data);
        onDataChange(data);
    }

    function handleDayChange(data)
    {
        const days = tripPlan.days.map(day => day.number === data.number ? { ...day, ...data } : day);
        setTripPlan({...tripPlan, days: days});
        onDataChange(tripPlan);
    }

    function handleDayDelete(number)
    {
        const days = [...tripPlan.days];
        const index = days.findIndex(day => day.number === number);
        days.splice(index, 1);    
        setTripPlan({...tripPlan, days: days});
        onDataChange(tripPlan);
    }

    const days = tripPlan.days.map((day) => <DayCard data={day} onDayChange={handleDayChange} onDayDelete={handleDayDelete}/>);

    return(
        <div className='trip_plan'>
            <TripInfo data={tripPlan} onDataChange={handleTripInfoChange}/>
            {/* <div style={{paddingRight: '10px', marginTop: '20px', borderBottom: '1px solid lightgray', fontWeight: 'bold'}}>פירוט ימים</div> */}
            {days}
            <Button style={styles.addButton} onClick={onAddDay}>הוספת יום</Button>
            <div><Button style={styles.button} onClick={onSaveChanges}>שמירת שינויים</Button></div>
        </div>
    );
}

function TripView({data})
{
    const tripDays = getTripDays(data);

    return(
        <div className='trip_view'>
            <div style={{backgroundColor: 'rgb(228, 167, 70)'}}>
                <div style={{fontSize: '30px'}}>{data.title}</div>
                <div style={{fontSize: '20px', borderBottom: '1px solid gray'}}>{data.sub_title}</div>
                <div style={styles.datesContainer}>
                    <div>תאריך התחלה: {data.start_date}</div>
                    <div>תאריך סיום: {data.end_date}</div>
                </div>
                <div>מספר ימים: {tripDays}</div>
            </div>
        </div>
    );
}

function EditorPage()
{
    const [planId, setPlanId]     = useState('');
    const [tripPlan, setTripPlan] = useState({});

    async function onLoadClick()
    {
        const plan = await fetchTripPlan(planId);
        setTripPlan(plan);
    }

    return(
        <div>
        {Object.keys(tripPlan).length 
        ?
            <div className='editor_container'>
                <TripPlan data={tripPlan} onDataChange={setTripPlan}/>
                <TripView data={tripPlan}/>
            </div>
        :
            <div style={styles.tripLoader}>
                <TextField style={styles.textField} size='small' label="Trip ID" onChange={(e) => setPlanId(e.target.value)}/>
                <Button style={styles.button} variant="outlined" onClick={onLoadClick}>LOAD TRIP</Button>
            </div>}
        </div>
    );
}

export default EditorPage;
