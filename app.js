const fs = require('fs/promises');

async function fun(){
    const CREATE_FILE = 'create file';
    const CREATE_DIR = 'create folder'
    const DELETE_FILE = 'delete file';
    const DELETE_FOLDER = 'delete folder';
    const DELETE_FOLDER_ALL = 'delete all from folder';
    const RENAME_FILE = 'rename file';
    const ADD_TO_FILE = 'add to file';

    const createFile = async(path)=>{
        try{
            let file = await fs.open(path,'r')
            console.log(`The file ${path} already exists`)
            file.close();
        }catch(e){
            try{
                let file = await fs.open(path,'w')
                console.log("Created File")
                file.close();
            }catch(e){
                console.log("Cannont create file at given location")
            }
        }
        
    }
    const deleteFile = async(path)=>{
        try{
            let file = await fs.open(path,'r');
            await fs.rm(path);
            console.log("File Deleted");
            file.close();
        }catch(e){
            console.log(`File ${path} not found`)
        }
    }
    const renameFile = async(oldFilePath,newFilePath)=>{
        let old = false;
        try{
            let file = await fs.open(oldFilePath,'r')
            old = true;
            let newfile = await fs.open(newFilePath,'r');
            console.log(`Another file ${newFilePath} already exist`)
            file.close();
            newFile.close();

        }catch(e){
            if(!old)console.log(`File ${oldFilePath} not found`);
            else{
                try{
                    await fs.rename(oldFilePath,newFilePath)
                }catch(e){
                    console.log("Cannot raname to destination path");
                }
                console.log('File Renamed')
            }
        }
    }
    const addToFile = async(path,content)=>{
        try{
            let file = await fs.open(path,'w');
            await file.write(content);
            console.log("Added content to file")
        }catch(e){
            console.log(`Cannot write to file ${path}`)
        }
    }
    const createDir = async(path)=>{
        try{
            await fs.mkdir(path)
            console.log("Created folder");
        }catch(e){
            console.log(`Cannot create ${path} folder`);
        }
    }
    const deleteDir = async(path)=>{
        try{
            await fs.rmdir(path)
            console.log("Deleted folder");
        }catch(e){
            console.log(e);
            console.log(`Cannot delete ${path} folder`);
        }
    }
    const deleteDirAll = async(path)=>{
        try{
            await fs.rm(path,{ recursive: true, force: true })
            console.log("Deleted folder");
        }catch(e){
            console.log(e);
            console.log(`Cannot delete ${path} folder`);
        }
    }
    const fd = await fs.open('./command.txt','r')
    fd.on('change',async()=>{
        const size = (await fd.stat()).size;
            const buff = Buffer.alloc(size);
            const offset = 0;
            const length = buff.byteLength;
            const position = 0;

            await fd.read(buff,offset,length,position)
            const command = buff.toString();
            // create file <path>
            if(command.includes(CREATE_FILE)){
                const filePath = command.substring(CREATE_FILE.length+1).trim()
                createFile(filePath)
            }
            // delete file <path>
            if(command.includes(DELETE_FILE)){
                const filePath = command.substring(DELETE_FILE.length+1).trim();
                deleteFile(filePath);
            }
            // rename file <oldFilePath> to <newFilePath>
            if(command.includes(RENAME_FILE)){
                const _idx = command.indexOf(' to ');
                if(_idx>=0){
                    const oldFilePath = command.substring(DELETE_FILE.length+1,_idx).trim();
                    const newFilePath = command.substring(_idx+4).trim();
                    renameFile(oldFilePath,newFilePath)
                }
            }
            // add to file <path> content: <content>
            if(command.includes(ADD_TO_FILE)){
                const _idx = command.indexOf(' content: ');
                if(_idx>=0){
                    const filePath = command.substring(ADD_TO_FILE.length+1,_idx).trim();
                    const fileContent = command.substring(_idx+10);
                    // console.log(ADD_TO_FILE,filePath,fileContent)
                    addToFile(filePath,fileContent);
                }
            }
            // create folder <path>
            if(command.includes(CREATE_DIR)){
                const filePath = command.substring(CREATE_DIR.length+1).trim()
                createDir(filePath)
            }
            // delete folder <path>
            if(command.includes(DELETE_FOLDER)){
                const filePath = command.substring(DELETE_FOLDER.length+1).trim()
                deleteDir(filePath)
            }
            // delete all from folder <path>
            if(command.includes(DELETE_FOLDER_ALL)){
                const filePath = command.substring(DELETE_FOLDER_ALL.length+1).trim()
                deleteDirAll(filePath)
            }
    })
    const watcher =  fs.watch('./command.txt'); 
    for await (const event of watcher){
        if(event.eventType === 'change'){
            fd.emit('change')
        } 
    }
    fd.close();
}
fun();
