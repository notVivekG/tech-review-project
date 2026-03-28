import React, {useId, forwardRef} from 'react'

const Input = React.forwardRef ( function Input({
    label, 
    type = "text",
    className = "",
    id : propId,
    ...props
}, ref){
    const generatedId = useId()
    const id = propId ?? generatedId;
    return (
        <div className="w-full">
            {label && (
                <label className='inline-block mb-1 pl-1 text-sm text-slate-200'
                    htmlFor={id}>
                    {label}
                </label>
            )}
            <input 
                type={type}
                className={`px-3 py-2 rounded-lg bg-slate-900/60 text-slate-100 outline-none focus:bg-slate-900 duration-200 border border-slate-700 focus:border-emerald-400 placeholder:text-slate-500 w-full ${className}`}
                ref={ref}
                {...props}
                id={id}
            />
        </div>
    )
})

export default Input