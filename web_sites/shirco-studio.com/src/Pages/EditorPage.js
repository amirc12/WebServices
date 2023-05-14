import './EditorPage.css';
import * as React from 'react';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

const constants = require("../constants");

const styles =
{
    button      : {height: '25px', marginLeft: '5px', margin: '5px', backgroundColor: 'white'},
    filterInput : {height: '25px', width: '60px', marginLeft: '10px'},
    textField   : {backgroundColor: 'white', width: '100%'},
    cardTitle   : {display: 'flex', alignItems: 'center', backgroundColor: 'lightblue', color: 'black', paddingLeft: '20px', borderBottom: '1px solid gray'}
};

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

    return(
        <div className='editor_card'>
            <TextField style={styles.textField} size='small' label="Training Name" defaultValue={data.name} onChange={onNameChanged}/>
            <TextField style={styles.textField} multiline label="Training Details" rows={20} defaultValue={data.details} onChange={onDetailsChanged}/>
        </div>
    );
}

function ContentCard({data})
{
    return(
        <div className='content_card'>
            <div style={{borderBottom: "1px solid lightgray", padding: "5px"}}>{data.name}</div>
            <div style={{marginTop: "5px", padding: "5px", whiteSpace: "pre-wrap"}}>{data.details}</div>
        </div>
    );
}

async function postPlan(plan)
{
    const options =
    {
        method  : "POST",
        headers : {},
        body    : JSON.stringify(plan)
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

function TrainingCard({data, onEditClick})
{
    const [oldData, setOldData] = useState({...data});
    const [newData, setNewData] = useState({...data});
    const [isEditMode, setIsEditMode] = useState(false);

    function onDataChanged(data)
    {
        setNewData({...data});
    }

    async function onClickSave()
    {
        await postPlan(newData);

        setOldData({...newData});
        setIsEditMode(!isEditMode);
    }

    const buttonText = isEditMode ? 'Close' : 'Edit';
    const buttonIcon = isEditMode ? <CancelIcon /> : <EditIcon />;
    
    return(
        <div className='training_card'>
            <div style={styles.cardTitle}>
                <div style={{flex: "1"}}>{data.header}</div>
                {data.edit && <Button style={styles.button} variant="outlined" onClick={() => setIsEditMode(!isEditMode)} endIcon={buttonIcon}>{buttonText}</Button>}
                {isEditMode && <Button style={styles.button} variant="outlined" onClick={onClickSave} endIcon={<SaveIcon />}>Save</Button>}
            </div>
            <div style={{display: 'flex'}}>
                <ContentCard data={oldData} />
                {isEditMode && <EditorCard data={newData} onDataChanged={onDataChanged}/>}
            </div>
        </div>
    );
}

async function fetchWeekPlan(edit)
{
    const url      = `${constants.API_URL}/week_plan?q=${edit}`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    return data;
}

function EditorPage({edit='edit'})
{
    const [weekPlan, setWeekPlan] = useState([]);

    useEffect(() => 
    {
        async function fetchData() 
        {
            const weekPlan = await fetchWeekPlan(edit);
            setWeekPlan(weekPlan);
        }
        fetchData();
    }, []);

    const cards = weekPlan.map((item) => <TrainingCard data={item} />);

    return(
        <div className='container'>
            {cards}
        </div>
    );
}

export default EditorPage;
