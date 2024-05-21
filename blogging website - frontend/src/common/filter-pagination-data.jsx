import axios from "axios";

export const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
  user,
}) => {
  let obj;

  //   let headers = {};

  //   if (user) {
  //     headers.headers = {
  //       Authorization: `Bearer ${user}`,
  //     };
  //   }

  if (state != null && !create_new_arr) {
    obj = { ...state, results: [...state.results, ...data], page: page };
  } else {
    console.log("i am object 1 ");
    await axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + countRoute,
        data_to_send,
        // headers,
      )
      .then(({ data: { totalDocs } }) => {
        console.log(data);
        obj = {
          results: data,
          page: 1,
          totalDocs,
        };
        console.log("the obj is ", obj);
      })
      .catch((err) => {
        return console.log(err.message);
      });
  }

  return obj;
};
