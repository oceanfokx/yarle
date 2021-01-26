import { applyTemplate } from './utils/templates/templates';
import {
  getMetadata,
  getTags,
  isComplex,
  saveHtmlFile,
  saveMdFile,
} from './utils';
import { yarleOptions } from './yarle';
import { processResources } from './process-resources';
import { convertHtml2Md } from './convert-html-to-md';
import { convert2Html } from './convert-to-html';
import { NoteData } from './models/NoteData';
import { logger } from './utils/logger';

export const processNode = (note: any, notebookName: string): void => {

  let dateStarted: Date = new Date();  
  logger.info("\n");
  logger.info("Started conversion: " + dateStarted);

  if (Array.isArray(note.content))
    note.content = note.content.join('');
  let noteData: NoteData = { 
    title: note.title,
    content: note.content,
    htmlContent: note.content,
    originalContent: note.content,
  };

  // tslint:disable-next-line:no-console
  logger.info(`Converting note "${noteData.title}"...`);

  try {
    if (isComplex(note)) {
      noteData.htmlContent = processResources(note);
    }

    noteData = {...noteData, ...convertHtml2Md(yarleOptions, noteData)};
    noteData = {...noteData, ...getMetadata(note, notebookName)};
    noteData = {...noteData, ...getTags(note)};

    const data = applyTemplate(noteData, yarleOptions);
    // tslint:disable-next-line:no-console
    logger.info('data =>\n', JSON.stringify(data), '\n***');

    saveMdFile(data, note);

    if (yarleOptions.keepOriginalHtml){
      convert2Html(noteData);
      saveHtmlFile(noteData, note);
    }

  } catch (e) {
    // tslint:disable-next-line:no-console
    logger.info(`Failed to convert note: ${noteData.title}`, e);
  }
  // tslint:disable-next-line:no-console
  let dateFinished: Date = new Date();  
  let conversionDuration = (dateFinished.getTime()- dateStarted.getTime())/1000; //in seconds.
  logger.info("Finished conversion: " + dateFinished);  
  logger.info(`Note "${noteData.title}" converted successfully in ${conversionDuration} seconds.`);
  

};
