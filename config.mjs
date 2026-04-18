import rc from 'rc'

export const config = rc('mdcat', {
  port: 0,
  hostname: 'localhost',
  waitForStdin: 200
})
