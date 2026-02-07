import React, { createContext, useState, useContext } from 'react';

const EventContext = createContext();

export function EventProvider({ children }) {
    // Initialize from localStorage if available
    const [eventData, setEventData] = useState(() => {
        const savedData = localStorage.getItem('eventMindData');
        return savedData ? JSON.parse(savedData) : {
            eventType: '',
            description: '',
            budget: '',
            guestCount: '',
            priorities: {
                food: 'medium',
                venue: 'medium',
                entertainment: 'medium',
                decoration: 'medium',
            },
            theme: null,
            schedule: null,
            selectedVendors: [],
        };
    });

    // Save to localStorage whenever data changes
    React.useEffect(() => {
        localStorage.setItem('eventMindData', JSON.stringify(eventData));
    }, [eventData]);

    const updateEventData = (newData) => {
        setEventData(prev => ({ ...prev, ...newData }));
    };

    return (
        <EventContext.Provider value={{ eventData, updateEventData }}>
            {children}
        </EventContext.Provider>
    );
}

export function useEvent() {
    return useContext(EventContext);
}
