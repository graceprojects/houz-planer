export type OfficeFormat=200|400|600;
export type OfficeProgramme={format:OfficeFormat;reservePercent:number;items:{purposeId:string;quantity:number;unitArea:number}[]};
export type PlannedSpace={id:string;purposeId:string;name:string;x:number;y:number;w:number;d:number;level:number;color:string;enclosed:boolean};
