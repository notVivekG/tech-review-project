import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form';

export default function RTE({name, control, label, defaultValue = ""}) {
  const [Editor, setEditor] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('@tinymce/tinymce-react').then((mod) => {
      if (isMounted) setEditor(() => mod.Editor);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className='w-full'>
        {label && <label className='inline-block mb-1 text-sm pl-1'>{label}</label>}
        {!Editor ? (
          <div className="text-sm text-slate-400 py-2">Loading editor</div>
        ) : (
          <Controller
              name={name || "content"}
              control={control}
              render={({field: {onChange}}) => (
                  <Editor
                      apiKey="0jmw1300g4jx6jlbi2sp3zf6ac37b65p6nyt0vjojt5rkzkk"
                      initialValue={defaultValue}
                      init={{
                          branding: false,
                          height: 500,
                          menubar: true,
                          plugins: [
                              "image",
                              "advlist",
                              "autolink",
                              "lists",
                              "link",
                              "charmap",
                              "preview",
                              "anchor",
                              "searchreplace",
                              "visualblocks",
                              "code",
                              "fullscreen",
                              "insertdatetime",
                              "media",
                              "table",
                              "help",
                              "wordcount",
                          ],
                          toolbar:
                          "undo redo | blocks | image | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |removeformat | help",
                          content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"
                      }}
                      onEditorChange={onChange}
                  />
              )}
          />
        )}
    </div>
  )
}

// <Editor
    // initialValue='default value'
    // init={
    //     {
    //         branding: false,
    //         height: 500,
    //         menubar: true,
    //         plugins: [
    //             'advlist autolink lists link image charmap print preview anchor',
    //             'searchreplace visualblocks code fullscreen',
    //             'insertdatetime media table paste code help wordcount'
    //         ]
    //     }
    // }
    // />
