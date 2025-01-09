
export const dummyColumns = [
    { field: 'name', filter: 'agTextColumnFilter', flex: 1 },
    {
        field: 'age', filter: 'agTextColumnFilter', flex: 1,
        // filterParams: {
        //     filterOptions: ['contains', 'equals', 'startsWith'], // Specify allowed options
        // }
    },
    {
        field: 'country',
        type: 'amount',
        filterParams: {
            values: ["USA", "Canada",], // Dynamic values from external JSON
            filterOptions: ['contains', 'equals', 'startsWith'], // Specify allowed options from frontend
            width: '400px',
        },
        flex: 1
    },
    {
        field: 'date',
        filter: 'agDateColumnFilter',
        flex: 1
    },
];
export const dummyData = [
    { "name": "John Doe", "age": 25, "country": "USA", "date": "2024-01-01" },
    { "name": "Jane Smith", "age": 30, "country": "Canada", "date": "2024-01-01" },
    { "name": "Raj Patel", "age": 35, "country": "India", "date": "2024-01-01" },
    { "name": "Hans Zimmer", "age": 40, "country": "Germany", "date": "2024-01-01" },
    { "name": "Marie Curie", "age": 28, "country": "France", "date": "2024-01-01" }
];


