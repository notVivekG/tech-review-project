import React, {forwardRef, useId} from 'react'

const Select = forwardRef(function Select({
    options,
    label,
    className = "",
    ...props
}, ref) {

    const id = useId();

    return (
        <div className='w-full'>
            {label && (
                <label htmlFor={id} className='inline-block mb-1 pl-1 text-sm text-slate-200'>
                    {label}
                </label>
            )}
            <select
                {...props}
                id={id}
                ref={ref}
                className={`px-3 py-2 rounded-lg bg-slate-900/60 text-slate-100 outline-none focus:bg-slate-900 duration-200 border border-slate-700 focus:border-emerald-400 w-full ${className}`}
            >
                {options?.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    )
})

export default Select