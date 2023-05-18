import './EditorPage.css';
import * as React from 'react';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

const moment = require("moment");
const constants = require("../constants");

const styles =
{
    button       : {height: '25px', marginLeft: '5px', margin: '5px', backgroundColor: 'white', color: 'rgb(231, 24, 115)'},
    selectedDate : {padding: '5px', float: 'right', fontSize: '20px', paddingRight: '5px', backgroundColor: 'rgb(246, 251, 251)', borderBottom: '2px solid rgb(231, 24, 115)'},
    filterInput  : {height: '25px', width: '60px', marginLeft: '10px'},
    textField    : {backgroundColor: 'white', width: '100%'},
    textFieldRtl : {backgroundColor: 'white', width: '100%', direction: 'rtl'},
    cardTitle    : {display: 'flex', alignItems: 'center', backgroundColor: 'rgb(231, 24, 115)', color: 'white', paddingLeft: '20px', borderBottom: '1px solid gray'}
};

async function postPlan(data, date)
{
    const options =
    {
        method  : "POST",
        headers : {},
        body    : JSON.stringify({date: date, day: data})
    };

    try
    {
        const url      = `${constants.API_URL}/update_plan`;
        const response = await fetch (url, options);
        const data     = await response.json();    
    }
    catch(e)
    {
        console.log(e);
        // debugger;
    }
}

function ContentCard({data})
{
    return(
        <div className='content_card'>
            <div style={{borderBottom: "2px solid rgb(231, 24, 115)", padding: "5px"}}>{data.name}</div>
            <div style={{marginTop: "5px", padding: "5px", borderBottom: "1px solid lightgray", whiteSpace: "pre-wrap"}}>{data.warm_up}</div>
            <div style={{marginTop: "5px", padding: "5px", whiteSpace: "pre-wrap"}}>{data.details}</div>
            {data.ex_details && 
            <div style={{backgroundColor: 'beige', border: "1px solid lightgray", borderRadius: '5px', padding: "5px", marginTop: '10px', direction: 'rtl'}}>
                <div style={{padding: "5px", borderBottom: '1px solid lightgray', fontSize: '18px'}}>מילה של מאמנת</div>
                <div style={{padding: "5px", whiteSpace: "pre-wrap"}}>{data.ex_details}</div>
            </div>}
        </div>
    );
}

function EditorCard({data, onDataChanged})
{
    function onNameChanged(e)
    {
        data.name = e.target.value;
        onDataChanged(data);
    }

    function onDetailsChanged(e)
    {
        data.details = e.target.value;
        onDataChanged(data);
    }

    function onExDetailsChanged(e)
    {
        data.ex_details = e.target.value;
        onDataChanged(data);
    }

    function onWarmupChanged(e)
    {
        data.warm_up = e.target.value;
        onDataChanged(data);
    }
    
    return(
        <div className='editor_card'>
            <TextField style={styles.textField} size='small' label="Training Name" defaultValue={data.name} onChange={onNameChanged}/>
            <TextField style={styles.textField} multiline label="Warm Up" rows={10} defaultValue={data.warm_up} onChange={onWarmupChanged}/>
            <TextField style={styles.textField} multiline label="Training Details" rows={20} defaultValue={data.details} onChange={onDetailsChanged}/>
            <TextField style={styles.textFieldRtl} multiline label="מילה של מאמנת" rows={10} defaultValue={data.ex_details} onChange={onExDetailsChanged}/>
        </div>
    );
}

function TrainingCard({data, edit, date})
{
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [oldData, setOldData] = useState({...data});
    const [newData, setNewData] = useState({...data});
    const [originDate, setOriginDate] = useState(date);

    if(date !== originDate)
    {
        setOriginDate(date);
        setOldData(data);
        setNewData(data);
    }

    function onDataChanged(data)
    {
        setNewData({...data});
    }

    async function onClickSave()
    {
        await postPlan(newData, date);

        setOldData({...newData});
        setIsEditorOpen(!isEditorOpen);
    }

    const buttonText = isEditorOpen ? 'Close' : 'Edit';
    const buttonIcon = isEditorOpen ? <CancelIcon /> : <EditIcon />;
    
    const editData = {...newData}; //dont want the newData to be changed by the editor component
    return(
        <div className='training_card'>
            <div style={styles.cardTitle}>
                <div style={{flex: "1"}}>{data.header}</div>
                {edit && <Button style={styles.button} variant="outlined" onClick={() => setIsEditorOpen(!isEditorOpen)} endIcon={buttonIcon}>{buttonText}</Button>}
                {isEditorOpen && <Button style={styles.button} variant="outlined" onClick={onClickSave} endIcon={<SaveIcon />}>Save</Button>}
            </div>
            <div style={{display: 'flex'}}>
                <ContentCard data={oldData} />
                {isEditorOpen && <EditorCard data={editData} onDataChanged={onDataChanged}/>}
            </div>
        </div>
    );
}

async function fetchWeekPlan(date, edit)
{
    const url      = `${constants.API_URL}/week_plan?date=${date}`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    return data;
}

async function deleteWeekPlan(date)
{
    const url      = `${constants.API_URL}/delete?date=${date}`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    // const data     = await response.json();

    // return data;

}

function HistoryCard({planDate, data, onDateChange, onRefresh, onCreateNew})
{
    const [refresf, setRefresh] = useState(true);

    async function onClickDelete(date)
    {
        // eslint-disable-next-line no-restricted-globals
        if(confirm("Are you sure?"))
        {
            await deleteWeekPlan(date);
            onRefresh();
            setRefresh(!refresf);
        }
    }

    const dates = data?.map((date, index) => 
    {
         return (planDate === date) 
                ?  <div key={index} style={styles.selectedDate}>{date}</div>
                :  <div key={index}>
                        <IconButton label="delete" onClick={() => onClickDelete(date)}><DeleteIcon /></IconButton>
                        <button onClick={() => onDateChange(date)}>{date}</button>
                    </div>
    });

    return(
        <div>
            <div className='history_card'>
                {dates}
            </div>
            <div style={{marginTop: '20px'}}><Button variant="outlined" onClick={onCreateNew}>Create New</Button></div>
        </div>
    );
}

function EditorPage({edit=true, showHistory})
{
    const [planDate, setPlanDate] = useState(moment().startOf('week').format('DD/MM/YYYY'));
    const [weekPlan, setWeekPlan] = useState({});
    const [refresh, setRefresh] = useState(1);

    function onCreateNew()
    {
        let newWeek = moment().startOf('week').format('DD/MM/YYYY');

        let weeksNum = 1;
        while(weekPlan.dates.indexOf(newWeek) >= 0 && weeksNum < 20) 
        {
            newWeek = moment().add(weeksNum++, 'week').startOf('week').format('DD/MM/YYYY');
        }

        setPlanDate(newWeek);
    }

    useEffect(() => 
    {
        async function fetchData() 
        {
            console.log('useEffect');
            const weekPlan = await fetchWeekPlan(planDate, edit);
            setWeekPlan(weekPlan);
        }
        fetchData();
    }, [planDate, refresh]);

    const cards = weekPlan?.plan?.days.map((item, index) => <TrainingCard key={index} data={item} edit={edit} date={weekPlan.plan.date}/>);

    return(
        <div className='editor_page'>
            {showHistory && <HistoryCard planDate={planDate} data={weekPlan.dates} onDateChange={setPlanDate} onRefresh={() => setRefresh(refresh+1)} onCreateNew={onCreateNew}/>}
            <div className='cards_container'>
                {cards}
            </div>
        </div>
    );
}

export default EditorPage;
