import React, { useState } from 'react';
import './Form.css'

const Form = (): JSX.Element => {
    const [text, setText] = useState('')

    const handleSubmit = (e: React.FormEvent<EventTarget>): void => {
        e.preventDefault()
        
    }
    return (
        <>
        <h1>Start</h1>
        <form onSubmit={() => undefined}  className="activate-form">
            <input className='activate-form__text' type="text" value={text} onChange={(e) => setText(e.target.value)}/>
            <input className='activate-form__btn' type="button" value={'Click to start'} onClick={(e) => handleSubmit(e)} />
        </form>
        </>
    );
};

export default Form;