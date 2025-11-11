import { devCookie } from '../types/types';

export const devCookiesList: devCookie[] = [
    {
        name: 'cookie123',
        values: ['1', '0'],
        description: 'some description for cookie123 displayed on hover',
    },
    {
        name: 'cookie456',
        values: ['enabled', 'disabled'],
        description: 'some description for cookie456 displayed on hover',
    },
    {
        name: 'cookie789',
        values: ['31232311', '04273462347648423432471'],
        description: 'some description for cookie789 displayed on hover',
    },
    {
        name: 'cookieWithLongerName',
        values: ['true', 'false'],
        description: 'some description for cookieWithLongerName displayed on hover',
    },
    {
        name: 'cookieWith3Values',
        values: ['1', '2', '3'],
        description: 'some description for cookieWith3Values displayed on hover',
    },
];
