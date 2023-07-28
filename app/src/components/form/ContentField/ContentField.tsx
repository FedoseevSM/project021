import React, { useEffect, useRef, useMemo, useState } from 'react';
import { getJwtToken } from 'api/request';
import EditorJs from 'react-editor-js';
import axios from 'axios';
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import List from "@editorjs/list";
// import Underline from '@editorjs/underline';
// import Warning from "@editorjs/warning";
import Code from "@editorjs/code";
import Marker from "@editorjs/marker";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Delimiter from "@editorjs/delimiter";
import Popup from 'components/common/Popup/Popup';

import cx from 'classnames';

import { staticBase, apiEndpoint } from 'helpers/constants';


import s from './ContentField.module.scss';

interface IProps {
  value: any;
  onChange(data: any, html: string): any;
  allowedTags?: string[];
  actions?: string[];
  placeholder?: string;
  className?: string;
  outerRef?: any;
  error?: string;
}


export default function ContentField({ error, allowedTags, actions, onChange, value, placeholder, className, outerRef }: IProps) {

  const containerRef = useRef<any>(null);
  const [data, setData] = useState<any | undefined>(value);
  const [internalError, setInternalError] = useState('');

  const tools = useMemo(
    () => {
      return {
        embed: Embed,
        table: Table,
        marker: Marker,
        list: List,
        // warning: Warning,
        code: Code,
        // linkTool: LinkTool,
        // hyperlink: {
        //   class: Hyperlink,
        //   config: {
        //     target: '_blank',
        //     rel: 'nofollow',
        //     availableTargets: ['_blank', '_self'],
        //     availableRels: ['noreferrer'],
        //     validate: false,
        //   }
        // },
        // paragraph: {
        //   class: Paragraph,
        //   config: {
        //     placeholder: placeholder || 'Start writing here'
        //   }
        // },
        image: {
          class: Image,
          config: {
            types: 'image/png, image/jpg, image/gif, image/jpeg',
            uploader: {
              uploadByUrl: async (url: string) => {
                return { 
                  success: 1,
                  file: {
                    url,
                  }
                };
              },
              uploadByFile: async (file: File) => {
                if (file.size / 1000000 > 10) {
                  setInternalError('Изображение слишком большое (10мб макс.)');
                  return {
                    success: 0,
                  };
                }
                const formData = new FormData();
                formData.append('file', file)
      
                const config: any = {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${getJwtToken()}`
                  },
                };
                const { data: { url }} = await axios.post(`${apiEndpoint}/files`, formData, config);
                return { 
                  success: 1,
                  file: {
                    url: `${staticBase}${url}`,
                  }
                };
              }
            }
          }
        },
        // raw: Raw,
        header: Header,
        // quote: Quote,
        // checklist: CheckList,
        delimiter: Delimiter,
        // inlineCode: InlineCode,
        // simpleImage: SimpleImage
      };
    },
    []
  );

  return (
    <div 
      className={cx(s.field, { [s.errorField]: !!error, [className!]: !!className })}
    >
      <EditorJs 
        tools={tools}
        data={data}
        onReady={() => {
          if (containerRef.current) {
            containerRef.current.save();
          }
        }}
        // @ts-ignore
        onChange={async (api: any, data: any) => {
          console.log(containerRef.current);
          if (containerRef.current) {
            await containerRef.current.save();
          }
          const html = convertToHTML(data);
          onChange(data, html);
        }}
        instanceRef={ref => containerRef.current = ref}
      />
      {error && (
        <div className={s.error}>{error}</div>
      )}
      {internalError && <Popup onClose={() => setInternalError('')} title="Ошибка">
        {internalError}
      </Popup>}
    </div>
  );
}

function convertToHTML(json: any) {
  var output = '';

  json.blocks.forEach((block: any) => {
    console.log(block);
    switch(block.type) {
      case 'header':
        output += '<div class="ce-block"><div class="ce-block__content"><h'
              + block.data.level + ' class="ce-header">'
              + block.data.text + '</h'
              + block.data.level + '></div></div>';
        break;
      case 'list':
        output += '<div class="ce-block"><div class="ce-block__content">';
        output += `<ul class="cdx-block cdx-list cdx-list--${block.data.style === 'unordered' ? 'un' : ''}ordered">`;
        block.data.items.forEach((el: any) => {
          output += `<li class="cdx-list__item">${el}</li>`
        })
        output += `</ul>`;
        output += '</div></div>'
        break;
      case 'paragraph':
        output += '<div class="ce-block"><div class="ce-block__content"><div class="ce-paragraph cdx-block">'
              + block.data.text + '</div></div></div>\n';
        break;
      case 'image':
        if (block.data.file?.url) {
          output += '<div class="ce-block"><div class="ce-block__content"><div class="image-tool image-tool--filled cdx-block">';
          output += '<div class="image-tool__image">';
          output += `<img class="image-tool__image-picture" src="${block.data.file.url}" >`;
          output += `</div>`;
          if (block.data.caption) {
            output += `<div class="ce-paragraph cdx-block" data-placeholder="Caption">${block.data.caption}</div>`
          }
          output += '</div></div></div>';
        }
        break;
      case 'delimiter':
        output += '<div class="ce-block"><div class="ce-block__content"><div class="ce-delimiter cdx-block"></div></div></div>';
        break;
      case 'code':
        output += '<div class="ce-block"><div class="ce-block__content"><div class="ce-code cdx-block">';
        output += `<textarea readonly class="ce-code__textarea">${block.data.code}</textarea>`;
        output += '</div></div></div>';
        break;
      case 'table':
        var rows = '';
        block.data.content.map((row: any) => {
            var cells = '';
            row.forEach( (cell: any) => {
                cells += '<td class="tc-table__cell"><div class="tc-table__area">'
                + cell + '</div></td>\n';
            });
            rows += '<tr>' + cells + '</tr>\n';
        });
        output += '<div class="ce-block"><div class="ce-block__content"><div class="tc-editor cdx-block">'
        + '<div class="tc-table__wrap"><table class="tc-table"><tbody>'
        + rows + '</tbody></table></div></div></div></div>\n';
        break;
      case 'checklist':
          var checklist = '';
          block.data.items.map((item: any) => {
              var checked_ext = '';
              if ( item.checked ) {
                  checked_ext = '--checked'
              }
              checklist += '<div class="cdx-checklist__item cdx-checklist__item'
              + checked_ext + '"><span class="cdx-checklist__item-checkbox"></span><div class="cdx-checklist__item-text">'
              + item.text + '</div></div>';
          });
          output += '<div class="ce-block"><div class="ce-block__content"><div class="cdx-block cdx-checklist">'
          + checklist + '</div></div></div>\n';
          break;
      case 'embed':
        if (block.data.embed || block.data.source) {
          output += `<div class="ce-block"><div class="ce-block__content"><div class="cdx-block embed-tool"><iframe style="width:100%;" height="320" frameborder="0" allowfullscreen="" src="${block.data.embed || block.data.source}" class="embed-tool__content"></iframe></div></div></div>`;
        }
        break;
    }
  })

  output += '';
  return output;
}