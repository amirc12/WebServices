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
    button       : {height: '25px', marginLeft: '5px', margin: '5px', backgroundColor: 'white', color: 'rgb(231, 24, 115)'},
    filterInput  : {height: '25px', width: '60px', marginLeft: '10px'},
    textField    : {backgroundColor: 'white', width: '100%'},
    textFieldRtl : {backgroundColor: 'white', width: '100%', direction: 'rtl'},
    cardTitle    : {display: 'flex', alignItems: 'center', backgroundColor: 'rgb(231, 24, 115)', color: 'white', paddingLeft: '20px', borderBottom: '1px solid gray'}
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

function ContentCard({data})
{
    return(
        <div className='content_card'>
            <div style={{borderBottom: "2px solid rgb(231, 24, 115)", padding: "5px"}}>{data.name}</div>
            <div style={{marginTop: "5px", padding: "5px", borderBottom: "1px solid lightgray", whiteSpace: "pre-wrap"}}>{data.warm_up}</div>
            <div style={{marginTop: "5px", padding: "5px", whiteSpace: "pre-wrap"}}>{data.details}</div>
            <div style={{backgroundColor: 'beige', border: "1px solid lightgray", padding: "5px", marginTop: '10px', direction: 'rtl'}}>מילה של מאמנת</div>
            <div style={{backgroundColor: 'beige', border: "1px solid lightgray", padding: "5px", whiteSpace: "pre-wrap", direction: 'rtl'}}>{data.ex_details}</div>
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
