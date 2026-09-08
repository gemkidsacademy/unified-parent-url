import React from "react";
import "./QuizScheduler.css";

import ConfigureScheduler from "./ConfigureScheduler/ConfigureScheduler";

export default function QuizScheduler({ loggedInUser, onBack }) {

    return (

        <div className="scheduler">

            <button
                type="button"
                className="quiz-scheduler-back-btn"
                onClick={onBack}
            >
                <span className="back-arrow">←</span>
                <span>Back</span>
            </button>

            <ConfigureScheduler
                loggedInUser={loggedInUser}
            />

        </div>

    );

}